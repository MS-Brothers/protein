const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'protein_auth'
  });

  // Create label_templates table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS label_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      background_image_url VARCHAR(500) NOT NULL,
      field_config JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('label_templates table created');

  // Alter product_labels to add template_id
  try {
    await connection.query(`
      ALTER TABLE product_labels 
      ADD COLUMN template_id INT,
      ADD CONSTRAINT fk_template
      FOREIGN KEY (template_id) REFERENCES label_templates(id) ON DELETE SET NULL
    `);
    console.log('Added template_id to product_labels');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('template_id already exists in product_labels');
    } else {
      console.error('Error altering product_labels:', error);
    }
  }

  await connection.end();
}

run();
