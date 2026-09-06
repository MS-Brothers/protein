require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'protein_auth'
    });

    const email = 'admin@protein.local';
    const plainPassword = 'Admin@12345';
    const adminId = 'ADM-001';
    const name = 'System Admin';

    // Check if admin already exists
    const [existing] = await connection.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Admin already exists.');
      await connection.end();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    await connection.query(
      'INSERT INTO admins (admin_id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [adminId, name, email, passwordHash]
    );

    console.log('Initial admin seeded successfully!');
    await connection.end();
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seedAdmin();
