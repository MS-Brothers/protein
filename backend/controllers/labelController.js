const db = require('../config/db');

// @desc    Save product label
// @route   POST /api/admin/labels
// @access  Private/Admin
const saveLabel = async (req, res) => {
  try {
    const {
      product_name,
      manufactured_by,
      country_of_origin,
      description,
      net_weight,
      quantity,
      batch_number,
      manufacturing_date,
      expiry_date,
      month_of_import,
      mrp
    } = req.body;

    const query = `
      INSERT INTO product_labels (
        product_name, manufactured_by, country_of_origin, description, 
        net_weight, quantity, batch_number, manufacturing_date, 
        expiry_date, month_of_import, mrp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      product_name || '',
      manufactured_by || '',
      country_of_origin || '',
      description || '',
      net_weight || '',
      quantity || '',
      batch_number || '',
      manufacturing_date || '',
      expiry_date || '',
      month_of_import || '',
      mrp || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Label saved successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Error saving label:', error);
    res.status(500).json({ success: false, message: 'Server error while saving label' });
  }
};

// @desc    Get all product labels
// @route   GET /api/admin/labels
// @access  Private/Admin
const getLabels = async (req, res) => {
  try {
    const [labels] = await db.query('SELECT * FROM product_labels ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: labels });
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching labels' });
  }
};

module.exports = {
  saveLabel,
  getLabels
};
