const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all outfits
router.get('/', async (req, res) => {
  try {
    const { data: outfits, error } = await supabase
      .from('outfits')
      .select(`
        *,
        products (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, outfits });
  } catch (error) {
    console.error('Error fetching outfits:', error);
    res.status(500).json({
      error: 'Failed to fetch outfits',
      message: error.message
    });
  }
});

// Get single outfit by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: outfit, error } = await supabase
      .from('outfits')
      .select(`
        *,
        products (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    res.json({ success: true, outfit });
  } catch (error) {
    console.error('Error fetching outfit:', error);
    res.status(500).json({
      error: 'Failed to fetch outfit',
      message: error.message
    });
  }
});

// Create new outfit
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      template_type,
      combined_image_url,
      canvas_width,
      canvas_height,
      products
    } = req.body;

    // Debug: log what we received
    console.log('Creating outfit with products:', products?.map(p => ({ name: p.product_name, link: p.product_link })));

    // Create outfit
    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .insert([{
        name,
        description,
        template_type,
        combined_image_url,
        canvas_width,
        canvas_height
      }])
      .select()
      .single();

    if (outfitError) throw outfitError;

    // Create products if provided
    if (products && products.length > 0) {
      const productsWithOutfitId = products.map(product => ({
        ...product,
        outfit_id: outfit.id
      }));

      console.log('About to insert products:', JSON.stringify(productsWithOutfitId, null, 2));

      const { data: createdProducts, error: productsError } = await supabase
        .from('products')
        .insert(productsWithOutfitId)
        .select();

      if (productsError) throw productsError;

      outfit.products = createdProducts;
    }

    res.status(201).json({
      success: true,
      outfit
    });
  } catch (error) {
    console.error('Error creating outfit:', error);
    res.status(500).json({
      error: 'Failed to create outfit',
      message: error.message
    });
  }
});

// Update outfit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      template_type,
      combined_image_url,
      canvas_width,
      canvas_height,
      products
    } = req.body;

    // Debug: log what we received
    console.log('Updating outfit with products:', products?.map(p => ({ name: p.product_name, link: p.product_link })));

    // Update outfit
    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .update({
        name,
        description,
        template_type,
        combined_image_url,
        canvas_width,
        canvas_height
      })
      .eq('id', id)
      .select()
      .single();

    if (outfitError) throw outfitError;

    // Update products if provided
    if (products && products.length > 0) {
      // Delete existing products
      await supabase
        .from('products')
        .delete()
        .eq('outfit_id', id);

      // Insert new products
      const productsWithOutfitId = products.map(product => ({
        ...product,
        outfit_id: id
      }));

      const { data: createdProducts, error: productsError } = await supabase
        .from('products')
        .insert(productsWithOutfitId)
        .select();

      if (productsError) throw productsError;

      outfit.products = createdProducts;
    }

    res.json({
      success: true,
      outfit
    });
  } catch (error) {
    console.error('Error updating outfit:', error);
    res.status(500).json({
      error: 'Failed to update outfit',
      message: error.message
    });
  }
});

// Delete outfit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete outfit (products will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Outfit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting outfit:', error);
    res.status(500).json({
      error: 'Failed to delete outfit',
      message: error.message
    });
  }
});

module.exports = router;
