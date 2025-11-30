import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import OutfitCanvas, { CANVAS_WIDTH, CANVAS_HEIGHT } from '../components/OutfitCanvas';
import api from '../config/api';
import { supabase } from '../config/supabase';
import { Canvas, FabricImage } from 'fabric';

const OutfitBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [products, setProducts] = useState([]);
  const [template, setTemplate] = useState('full_outfit');
  const [outfitName, setOutfitName] = useState('');
  const [outfitDescription, setOutfitDescription] = useState('');
  const [gender, setGender] = useState('woman');
  const [category, setCategory] = useState('Casual');
  const [canvasData, setCanvasData] = useState({ products: [] });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  const CATEGORIES = ['Casual', 'Work', 'Evening', 'Date Night', 'Sport'];

  // Load existing outfit data when editing
  useEffect(() => {
    if (isEditing && id) {
      loadOutfit(id);
    }
  }, [id, isEditing]);

  const loadOutfit = async (outfitId) => {
    try {
      setLoading(true);
      const result = await api.getOutfit(outfitId);
      const outfit = result.outfit;

      setOutfitName(outfit.name || '');
      setOutfitDescription(outfit.description || '');
      setTemplate(outfit.template_type || 'full_outfit');
      setGender(outfit.gender || 'woman');
      setCategory(outfit.category || 'Casual');

      // Transform products from database format to component format
      const loadedProducts = outfit.products.map(p => ({
        originalUrl: p.original_image_url,
        processedUrl: p.processed_image_url,
        fileName: p.processed_image_url.split('/').pop(),
        productLink: p.product_link || '',
        productName: p.product_name || '',
        category: p.category || 'top',
        position_x: p.position_x,
        position_y: p.position_y,
        scale_x: p.scale_x,
        scale_y: p.scale_y,
        rotation: p.rotation,
        width: p.width,
        height: p.height,
        z_index: p.z_index,
      }));

      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading outfit:', error);
      alert('Failed to load outfit: ' + error.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleImageProcessed = (productData) => {
    setProducts([...products, productData]);
  };

  const handleCanvasChange = (data) => {
    setCanvasData(data);
  };

  const handleRemoveProduct = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const handleUpdateProductLink = (index, newLink) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], productLink: newLink };
    setProducts(newProducts);
  };

  const handleUpdateProductName = (index, newName) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], productName: newName };
    setProducts(newProducts);
  };

  const exportAsImage = async () => {
    setExporting(true);

    try {
      // Create a temporary canvas for export
      const exportCanvas = new Canvas(null, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: '#ffffff',
      });

      // Use canvasData if available, otherwise use products state
      const productsToExport = canvasData.products.length > 0 ? canvasData.products : products;

      // Add all products to the export canvas
      for (const product of productsToExport) {
        const img = await FabricImage.fromURL(product.processedUrl, {
          crossOrigin: 'anonymous'
        });

        img.set({
          left: product.position_x,
          top: product.position_y,
          scaleX: product.scale_x,
          scaleY: product.scale_y,
          angle: product.rotation,
          originX: 'center',
          originY: 'center',
        });

        exportCanvas.add(img);
      }

      // Render and export
      exportCanvas.renderAll();
      const dataURL = exportCanvas.toDataURL({
        format: 'png',
        quality: 1,
      });

      // Convert data URL to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `outfit-${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from('outfit-images')
        .upload(`combined/${fileName}`, blob, {
          contentType: 'image/png',
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('outfit-images')
        .getPublicUrl(`combined/${fileName}`);

      exportCanvas.dispose();
      setExporting(false);

      return publicUrl;
    } catch (error) {
      console.error('Export error:', error);
      setExporting(false);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!outfitName.trim()) {
      alert('Please enter an outfit name');
      return;
    }

    if (products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    setSaving(true);

    try {
      // Export the outfit as an image
      const combinedImageUrl = await exportAsImage();

      // Debug: Check what we have before merging
      console.log('Products state (with links):', products.map(p => ({ processedUrl: p.processedUrl, link: p.productLink })));
      console.log('Canvas data products:', canvasData.products.map(p => ({ processedUrl: p.processedUrl, link: p.productLink })));

      // If canvas data is empty, get current canvas data
      let finalCanvasData = canvasData;
      if (canvasData.products.length === 0) {
        // Manually get canvas data from the canvas component
        const canvas = document.querySelector('canvas');
        if (canvas) {
          // Canvas exists but data hasn't been synced yet, use products state directly
          finalCanvasData = { products: products };
        }
      }

      // Merge canvas data (visual properties) with products data (metadata like links)
      const mergedProducts = finalCanvasData.products.map((canvasProduct) => {
        // Find the matching product from the products state to get updated metadata
        const matchingProduct = products.find(p => p.processedUrl === canvasProduct.processedUrl);

        return {
          product_name: matchingProduct?.productName || canvasProduct.productName || '',
          product_link: matchingProduct?.productLink || canvasProduct.productLink || '',
          original_image_url: canvasProduct.originalUrl || matchingProduct?.originalUrl || '',
          processed_image_url: canvasProduct.processedUrl,
          category: canvasProduct.category || matchingProduct?.category || 'top',
          position_x: canvasProduct.position_x ?? matchingProduct?.position_x ?? 200,
          position_y: canvasProduct.position_y ?? matchingProduct?.position_y ?? 200,
          scale_x: canvasProduct.scale_x ?? matchingProduct?.scale_x ?? 1,
          scale_y: canvasProduct.scale_y ?? matchingProduct?.scale_y ?? 1,
          rotation: canvasProduct.rotation ?? matchingProduct?.rotation ?? 0,
          width: canvasProduct.width ?? matchingProduct?.width ?? 100,
          height: canvasProduct.height ?? matchingProduct?.height ?? 100,
          z_index: canvasProduct.z_index ?? matchingProduct?.z_index ?? 0,
        };
      });

      // Prepare outfit data
      const outfitData = {
        name: outfitName,
        description: outfitDescription,
        template_type: template,
        combined_image_url: combinedImageUrl,
        canvas_width: CANVAS_WIDTH,
        canvas_height: CANVAS_HEIGHT,
        gender: gender,
        category: category,
        products: mergedProducts,
      };

      // Debug: log what we're saving
      console.log('Saving outfit data:', outfitData);
      console.log('Product links:', mergedProducts.map(p => ({ url: p.product_link, processedUrl: p.processed_image_url })));

      // Save to database
      const result = isEditing
        ? await api.updateOutfit(id, outfitData)
        : await api.createOutfit(outfitData);

      if (result.success) {
        alert(isEditing ? 'Outfit updated successfully!' : 'Outfit saved successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save outfit: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="outfit-builder">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading outfit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="outfit-builder">
      <header className="builder-header">
        <h1>{isEditing ? 'Edit Outfit' : 'Create New Outfit'}</h1>
        <button onClick={() => navigate('/')} className="btn-secondary">
          Back to Gallery
        </button>
      </header>

      <div className="builder-content">
        <div className="left-panel">
          <div className="section">
            <h2>Outfit Details</h2>
            <div className="form-group">
              <label htmlFor="outfitName">Outfit Name *</label>
              <input
                id="outfitName"
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="e.g., Summer Casual"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="outfitDescription">Description</label>
              <textarea
                id="outfitDescription"
                value={outfitDescription}
                onChange={(e) => setOutfitDescription(e.target.value)}
                placeholder="Optional description..."
                rows="3"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <div className="gender-switch">
                <button
                  type="button"
                  className={`gender-option ${gender === 'woman' ? 'active' : ''}`}
                  onClick={() => setGender('woman')}
                  disabled={saving}
                >
                  Woman
                </button>
                <button
                  type="button"
                  className={`gender-option ${gender === 'man' ? 'active' : ''}`}
                  onClick={() => setGender('man')}
                  disabled={saving}
                >
                  Man
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <div className="category-switch">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-option ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                    disabled={saving}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Add Products</h2>
            <ImageUpload onImageProcessed={handleImageProcessed} />
          </div>

          <div className="section products-list">
            <h3>Products ({products.length})</h3>
            {products.map((product, index) => (
              <div key={index} className="product-item-card">
                <div className="product-item-header">
                  <img src={product.processedUrl} alt={product.productName} />
                  <button
                    onClick={() => handleRemoveProduct(index)}
                    className="btn-delete"
                    title="Remove product"
                  >
                    ×
                  </button>
                </div>
                <div className="product-item-details">
                  <input
                    type="url"
                    value={product.productLink || ''}
                    onChange={(e) => handleUpdateProductLink(index, e.target.value)}
                    placeholder="Product link (https://...)"
                    className="product-link-input"
                  />
                  <span className="product-category-badge">{product.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <div className="canvas-section">
            <h2>Outfit Preview</h2>
            <OutfitCanvas
              products={products}
              template={template}
              onCanvasChange={handleCanvasChange}
            />
          </div>

          <div className="action-buttons">
            <button
              onClick={handleSave}
              disabled={saving || exporting || !outfitName}
              className="btn-primary btn-large"
            >
              {saving ? (isEditing ? 'Updating...' : 'Saving...') : exporting ? 'Exporting...' : (isEditing ? 'Update Outfit' : 'Save Outfit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitBuilder;
