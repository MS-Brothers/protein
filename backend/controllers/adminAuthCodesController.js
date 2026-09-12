const db = require('../config/db');
const xlsx = require('xlsx');

const uploadExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    // Check if required column exists in the first row (or keys of the object)
    const firstRowKeys = Object.keys(data[0]);
    if (!firstRowKeys.includes('authentication_code')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Excel format. Required column: authentication_code' 
      });
    }

    // Insert Initial Upload Record
    const [uploadResult] = await db.query(
      'INSERT INTO excel_uploads (file_name, total_entries, status) VALUES (?, ?, ?)',
      [req.file.originalname, data.length, 'PROCESSING']
    );
    const uploadId = uploadResult.insertId;

    let imported = 0;
    let excelDuplicates = 0;
    let existingCodes = 0;
    let invalid = 0;
    let failed = 0;
    const totalRows = data.length;

    // To track duplicates within the excel file itself
    const seenCodesInExcel = new Set();

    for (let i = 0; i < data.length; i++) {
      let code = data[i]['authentication_code'];
      
      // Ensure code is string and trimmed
      if (code !== undefined && code !== null) {
        code = String(code).trim();
      }

      if (!code || code === '') {
        invalid++;
        continue;
      }

      if (seenCodesInExcel.has(code)) {
        excelDuplicates++;
        continue;
      }
      seenCodesInExcel.add(code);

      try {
        // Check if code exists
        const [existing] = await db.query(
          'SELECT id FROM authentication_codes WHERE authentication_code = ?',
          [code]
        );

        if (existing.length > 0) {
          existingCodes++;
        } else {
          // Insert code
          await db.query(
            'INSERT INTO authentication_codes (authentication_code, upload_id) VALUES (?, ?)',
            [code, uploadId]
          );
          imported++;
        }
      } catch (err) {
        console.error(`Error processing code ${code}:`, err);
        failed++;
      }
    }

    // Update upload record with final stats
    await db.query(
      `UPDATE excel_uploads 
       SET excel_duplicates = ?, existing_codes = ?, imported_count = ?, status = ? 
       WHERE id = ?`,
      [excelDuplicates, existingCodes, imported, 'COMPLETED', uploadId]
    );

    const totalDuplicates = excelDuplicates + existingCodes;
    const failedTotal = invalid + failed;

    return res.status(200).json({
      success: true,
      message: 'Import Successful',
      summary: {
        totalRows,
        imported,
        totalDuplicates,
        excelDuplicates,
        existingCodes,
        invalid,
        failed,
        failedTotal
      }
    });

  } catch (error) {
    console.error('Excel processing error:', error);
    return res.status(500).json({ success: false, message: 'Error processing Excel file' });
  }
};

const getExcelUploads = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, 
        file_name, 
        total_entries,
        total_entries AS total_rows, 
        imported_count,
        imported_count AS successful_imports, 
        (excel_duplicates + existing_codes) AS duplicate_codes,
        excel_duplicates,
        existing_codes,
        GREATEST(0, total_entries - imported_count - excel_duplicates - existing_codes) AS failed_imports,
        status, 
        created_at, 
        updated_at 
      FROM excel_uploads 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching excel uploads:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getExcelUploadById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT 
        id, 
        file_name, 
        total_entries,
        total_entries AS total_rows, 
        imported_count,
        imported_count AS successful_imports, 
        (excel_duplicates + existing_codes) AS duplicate_codes,
        excel_duplicates,
        existing_codes,
        GREATEST(0, total_entries - imported_count - excel_duplicates - existing_codes) AS failed_imports,
        status, 
        created_at, 
        updated_at 
      FROM excel_uploads 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Upload not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching excel upload details:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getExcelUploadCodes = async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // Validate upload exists
    const [upload] = await db.query('SELECT id FROM excel_uploads WHERE id = ?', [uploadId]);
    if (upload.length === 0) {
      return res.status(404).json({ success: false, message: 'Upload not found' });
    }

    const [rows] = await db.query(
      'SELECT id, authentication_code FROM authentication_codes WHERE upload_id = ? AND label_used = FALSE ORDER BY id ASC',
      [uploadId]
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching codes for upload:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const markLabelUsed = async (req, res) => {
  try {
    const { codeStr } = req.params;
    
    const [existing] = await db.query(
      'SELECT id, label_used FROM authentication_codes WHERE authentication_code = ?', 
      [codeStr]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Authentication code not found' });
    }

    if (existing[0].label_used) {
      return res.status(400).json({ success: false, message: 'This code has already been used for a label' });
    }

    await db.query(
      'UPDATE authentication_codes SET label_used = TRUE, label_used_at = NOW() WHERE authentication_code = ?',
      [codeStr]
    );

    res.json({ success: true, message: 'Code marked as used successfully' });
  } catch (error) {
    console.error('Error marking label as used:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteExcelUpload = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const [rows] = await db.query('SELECT * FROM excel_uploads WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Upload not found' });
    }

    // Since authentication_codes has ON DELETE CASCADE for upload_id, deleting this upload 
    // will automatically delete all associated authentication codes. 
    // Verification history is separate and will not be deleted as it relies on user_id and string codes.
    await db.query('DELETE FROM excel_uploads WHERE id = ?', [id]);

    res.json({ success: true, message: 'Upload and associated codes deleted successfully' });
  } catch (error) {
    console.error('Error deleting excel upload:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const clearAllAuthCodes = async (req, res) => {
  try {
    // Delete all records from authentication_codes
    // verification_history is not affected because there's no FK constraint linking them.
    // excel_uploads is not affected because the FK is on authentication_codes pointing to excel_uploads.
    await db.query('DELETE FROM authentication_codes');

    res.json({ success: true, message: 'All authentication codes have been cleared successfully.' });
  } catch (error) {
    console.error('Error clearing all auth codes:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  uploadExcel,
  getExcelUploads,
  getExcelUploadById,
  deleteExcelUpload,
  clearAllAuthCodes,
  getExcelUploadCodes,
  markLabelUsed
};
