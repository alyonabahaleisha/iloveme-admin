const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all feedback
router.get('/', async (req, res) => {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete feedback by ID (optional - for admin to remove feedback)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
