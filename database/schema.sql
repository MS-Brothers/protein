CREATE DATABASE IF NOT EXISTS protein_auth;
USE protein_auth;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(20) UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  plaintext_password VARCHAR(255) NULL,
  marketing_consent BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS plaintext_password VARCHAR(255) NULL;


CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS authentication_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  authentication_code VARCHAR(100) NOT NULL UNIQUE,
  upload_id INT NULL,
  product_name VARCHAR(255),
  sku VARCHAR(100),
  batch_number VARCHAR(100),
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  first_verified_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  authentication_code VARCHAR(100) NOT NULL,
  verification_status ENUM('GENUINE', 'INVALID', 'ALREADY_VERIFIED') NOT NULL,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial default administrators (Password: Mayur@2004)
INSERT INTO admins (admin_id, name, email, password_hash)
VALUES 
('ADM-001', 'System Administrator', 'contact@globalhorizonexim.co.in', '$2b$10$vhS4mQW4l9l42tSlQmSBkO81qILxVAf09dRYUFHLTzK2xkbmISowO'),
('ADM-002', 'Admin Local', 'admin@protein.local', '$2b$10$vhS4mQW4l9l42tSlQmSBkO81qILxVAf09dRYUFHLTzK2xkbmISowO')
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), name=VALUES(name);


CREATE TABLE IF NOT EXISTS product_labels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255),
  manufactured_by VARCHAR(255),
  country_of_origin VARCHAR(100),
  description TEXT,
  net_weight VARCHAR(50),
  quantity VARCHAR(50),
  batch_number VARCHAR(100),
  manufacturing_date VARCHAR(100),
  expiry_date VARCHAR(100),
  month_of_import VARCHAR(100),
  mrp VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS excel_uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  total_entries INT DEFAULT 0,
  excel_duplicates INT DEFAULT 0,
  existing_codes INT DEFAULT 0,
  imported_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PROCESSING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE authentication_codes
ADD COLUMN IF NOT EXISTS upload_id INT NULL;

ALTER TABLE authentication_codes
ADD CONSTRAINT fk_upload_id
FOREIGN KEY (upload_id) REFERENCES excel_uploads(id) ON DELETE CASCADE;
