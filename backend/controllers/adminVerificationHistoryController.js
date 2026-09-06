const db = require('../config/db');

exports.getVerificationHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || 'ALL';

    let query = `
      SELECT 
        vh.authentication_code, 
        COALESCE(u.full_name, 'Unknown User') AS user_name,
        COALESCE(u.email, 'Unknown Email') AS email,
        vh.verification_status, 
        vh.verified_at
      FROM verification_history vh
      LEFT JOIN users u ON vh.user_id = u.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
      query += ` AND (vh.authentication_code LIKE ? OR u.full_name LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status !== 'ALL') {
      query += ` AND vh.verification_status = ?`;
      queryParams.push(status);
    }

    // Count total records for pagination
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    // Add ordering and pagination
    query += ` ORDER BY vh.verified_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit.toString(), offset.toString()); // Convert to string as limits in prepare statement might need specific handling or just pass as numbers if mysql2 handles it

    // In mysql2, limit and offset should be numbers, but when using execute, sometimes it has issues. It's safe to use numbers with execute if parameterized properly.
    // Actually, execute with LIMIT ? OFFSET ? works with numbers.
    const [rows] = await db.execute(query, [...queryParams.slice(0, -2), limit, offset]);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching verification history:', error);
    res.status(500).json({ success: false, message: 'Server error fetching verification history' });
  }
};
