import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import ThemeToggle from '../../components/ThemeToggle';
import { getApiUrl } from '../../config/api';
import './LabelEditor.css';

const fieldsList = [
  { id: 'manufacturedBy', label: 'Manufactured By', placeholder: 'e.g. ABC Company' },
  { id: 'countryOrigin', label: 'Country of Origin', placeholder: 'e.g. India' },
  { id: 'description', label: 'Description of Goods', placeholder: 'e.g. Protein Powder' },
  { id: 'netWeight', label: 'Net Weight', placeholder: 'e.g. 1 KG' },
  { id: 'quantity', label: 'Quantity', placeholder: 'e.g. 1' },
  { id: 'batchNo', label: 'Batch No.', placeholder: 'e.g. ABC123' },
  { id: 'manufacturingDate', label: 'Manufacturing Date', placeholder: 'e.g. 01/08/2026' },
  { id: 'expiryDate', label: 'Expiry Date', placeholder: 'e.g. 01/08/2028' },
  { id: 'monthOfImport', label: 'Month of Import', placeholder: 'e.g. August 2026' },
  { id: 'mrp', label: 'MRP', placeholder: 'e.g. 2999' }
];

const textStyle = {
  font: "bold 18px Arial, sans-serif",
  color: "#050a1f"
};

const TEMPLATE_SRC = '/label-editor/template.png';

export default function LabelEditor() {
  const [activeMobileTab, setActiveMobileTab] = useState('editor'); // 'editor' | 'preview'

  const [data, setData] = useState({
    manufacturedBy: '',
    countryOrigin: '',
    description: '',
    netWeight: '',
    quantity: '',
    batchNo: '',
    manufacturingDate: '',
    expiryDate: '',
    monthOfImport: '',
    mrp: '',
    authCode: ''
  });

  const [calibration, setCalibration] = useState({
    x: 992,
    y: 238,
    spacing: 42,
    fontSize: 28,
    mrpX: 1044,
    mrpY: 636,
    maskStyle: 'stretch',
    showDebug: false,
    qrX: 1468,
    qrY: 151,
    qrSize: 422,
    codeX: 1570,
    codeY: 623,
    codeFontSize: 34
  });

  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());
  const qrImageRef = useRef(new Image());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  
  const [excelUploads, setExcelUploads] = useState([]);
  const [selectedUploadId, setSelectedUploadId] = useState('');
  const [authCodes, setAuthCodes] = useState([]);
  const [isFetchingUploads, setIsFetchingUploads] = useState(false);
  const [isFetchingCodes, setIsFetchingCodes] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const img = imageRef.current;
    img.crossOrigin = "anonymous";

    const fallbacks = [
      '/label-editor/template.png',
      '/label-editor/template_1.png',
      '/label-editor/template.jpeg'
    ];
    let fallbackIdx = 0;

    img.onload = () => {
      setImageLoaded(true);
    };

    img.onerror = () => {
      fallbackIdx++;
      if (fallbackIdx < fallbacks.length) {
        img.src = fallbacks[fallbackIdx];
      }
    };

    img.src = TEMPLATE_SRC;

    if (img.complete && img.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, []);

  // Fetch excel uploads on mount
  useEffect(() => {
    const fetchUploads = async () => {
      setIsFetchingUploads(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(getApiUrl('/api/admin/auth-codes/excel-uploads'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setExcelUploads(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch excel uploads', err);
      } finally {
        setIsFetchingUploads(false);
      }
    };
    fetchUploads();
  }, []);

  // Fetch auth codes when excel upload changes
  useEffect(() => {
    if (!selectedUploadId) {
      setAuthCodes([]);
      setData(prev => ({ ...prev, authCode: '' }));
      return;
    }

    const fetchCodes = async () => {
      setIsFetchingCodes(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(getApiUrl(`/api/admin/auth-codes/excel-uploads/${selectedUploadId}/codes`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setAuthCodes(json.data);
          setData(prev => ({ ...prev, authCode: '' }));
        }
      } catch (err) {
        console.error('Failed to fetch auth codes', err);
      } finally {
        setIsFetchingCodes(false);
      }
    };
    fetchCodes();
  }, [selectedUploadId]);

  useEffect(() => {
    const generateQr = async () => {
      try {
        const url = data.authCode 
          ? `https://globalhorizonexim.co.in/login?code=${encodeURIComponent(data.authCode)}` 
          : 'https://globalhorizonexim.co.in/login';
        const qrDataUrl = await QRCode.toDataURL(url, { width: 400, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
        const img = qrImageRef.current;
        img.onload = () => setQrLoaded(prev => !prev);
        img.src = qrDataUrl;
      } catch (err) {
        console.error(err);
      }
    };
    generateQr();
  }, [data.authCode]);

  useEffect(() => {
    if (imageLoaded) {
      renderCanvas();
    }
  }, [data, calibration, imageLoaded, qrLoaded]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setData(prev => ({ ...prev, [id]: value }));
  };

  const handleCalibrationChange = (e) => {
    const { id, value, type, checked } = e.target;
    setCalibration(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : (type === 'range' ? parseInt(value, 10) : value)
    }));
  };

  const applyMask = (ctx, img, x, y, w, style, fontSize) => {
    const maskX = x - 4;
    const maskY = y - fontSize * 0.85;
    const maskH = fontSize * 1.1;
    const maskW = Math.max(w, 80);

    if (style === 'solid') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(maskX, maskY, maskW, maskH);
    } else if (style === 'stretch') {
      const sourceX = maskX + maskW - 2; // Take from far right where it's blank
      const sourceY = maskY;
      ctx.drawImage(
        img, 
        sourceX, sourceY, 1, maskH, 
        maskX, maskY, maskW, maskH 
      );
    }
  };

  const renderCanvas = (forceShowDebug = null) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img.complete || img.naturalWidth === 0) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const showDebug = forceShowDebug !== null ? forceShowDebug : calibration.showDebug;
    const { x: startX, y: startY, spacing, fontSize, mrpX, mrpY, maskStyle, qrX, qrY, qrSize, codeX, codeY, codeFontSize } = calibration;

    fieldsList.forEach((field, index) => {
      if (field.id === 'authCode') return;
      
      const val = data[field.id];
      
      let posX = startX;
      let posY = startY + (index * spacing);
      let maskWidth = 240; 
      
      if (field.id === 'mrp') {
        posX = mrpX;
        posY = mrpY;
        maskWidth = 180;
      }

      if (maskStyle !== 'none') {
        applyMask(ctx, img, posX, posY, maskWidth, maskStyle, fontSize);
      }

      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = textStyle.color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      
      if (val && val.trim() !== '') {
        ctx.fillText(val, posX, posY);
      }
      
      if (showDebug) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(posX, posY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw QR Code
    if (qrImageRef.current.complete && qrImageRef.current.naturalWidth > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);
      ctx.drawImage(qrImageRef.current, qrX, qrY, qrSize, qrSize);
    }

    // Draw Authentication Code
    const codeVal = data.authCode;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(codeX - 5, codeY - codeFontSize * 1.2, 330, codeFontSize * 1.6); 

    ctx.font = `bold ${codeFontSize}px Arial, sans-serif`;
    const displayCode = codeVal ? codeVal : '';
    if (displayCode) {
      ctx.fillStyle = '#d32f2f'; // Red color for CODE
      ctx.fillText(displayCode, codeX, codeY);
    }

    if (showDebug) {
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(codeX, codeY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(qrX, qrY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const markCodeAsUsed = async () => {
    if (!data.authCode) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(getApiUrl(`/api/admin/auth-codes/${data.authCode}/label-used`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setAuthCodes(prev => prev.filter(c => c.authentication_code !== data.authCode));
        setData(prev => ({ ...prev, authCode: '' }));
      }
    } catch (err) {
      console.error('Failed to mark code as used:', err);
    }
  };

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const wasDebug = calibration.showDebug;
    if (wasDebug) renderCanvas(false);
    
    const link = document.createElement('a');
    link.download = 'label_updated.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    if (wasDebug) renderCanvas(true);
    markCodeAsUsed();
  };

  const downloadPDF = () => {
    if (!canvasRef.current) return;
    const wasDebug = calibration.showDebug;
    if (wasDebug) renderCanvas(false);
    
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const orientation = canvas.width > canvas.height ? 'l' : 'p';
    
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save('label_updated.pdf');
    
    if (wasDebug) renderCanvas(true);
    markCodeAsUsed();
  };

  return (
    <div className="le-app-container">
      
      {/* Mobile Top Tab Bar */}
      <div className="le-mobile-tabs">
        <button
          onClick={() => setActiveMobileTab('editor')}
          className="btn"
          style={{
            flex: 1,
            minHeight: '38px',
            fontSize: '13px',
            background: activeMobileTab === 'editor' ? 'var(--primary)' : 'var(--table-row-hover)',
            color: activeMobileTab === 'editor' ? '#fff' : 'var(--text-primary)'
          }}
        >
          Editor Controls
        </button>
        <button
          onClick={() => setActiveMobileTab('preview')}
          className="btn"
          style={{
            flex: 1,
            minHeight: '38px',
            fontSize: '13px',
            background: activeMobileTab === 'preview' ? 'var(--primary)' : 'var(--table-row-hover)',
            color: activeMobileTab === 'preview' ? '#fff' : 'var(--text-primary)'
          }}
        >
          Live Preview
        </button>
      </div>

      {/* Editor Panel */}
      <div className={`le-editor-panel ${activeMobileTab === 'preview' ? 'hidden-mobile' : ''}`}>
        <div className="le-editor-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="btn btn-outline"
              style={{ minHeight: '32px', padding: '4px 10px', fontSize: '12px' }}
            >
              ← Admin Panel
            </button>
            <ThemeToggle />
          </div>
          <h1>Label Designer</h1>
          <p>Overlay dynamic parameters on product packaging</p>
        </div>
        
        {/* Fields inputs */}
        <div className="le-inputs-container">
          <div className="le-input-group">
            <label>Select Excel File</label>
            {isFetchingUploads ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0' }}>Loading uploads...</p>
            ) : excelUploads.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0' }}>No Excel files uploaded yet.</p>
            ) : (
              <select 
                value={selectedUploadId} 
                onChange={(e) => setSelectedUploadId(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginTop: '4px' }}
              >
                <option value="">-- Select Excel File --</option>
                {excelUploads.map(upload => (
                  <option key={upload.id} value={upload.id}>
                    {upload.file_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="le-input-group">
            <label>Select Authentication Code</label>
            {!selectedUploadId ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0' }}>Please select an Excel file first.</p>
            ) : isFetchingCodes ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0' }}>Loading codes...</p>
            ) : authCodes.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0' }}>No authentication codes available in this Excel file.</p>
            ) : (
              <select 
                value={data.authCode} 
                onChange={handleInputChange}
                id="authCode"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginTop: '4px' }}
              >
                <option value="">-- Select Code --</option>
                {authCodes.map(code => (
                  <option key={code.id} value={code.authentication_code}>
                    {code.authentication_code}
                  </option>
                ))}
              </select>
            )}
          </div>

          {fieldsList.map(field => (
            <div className="le-input-group" key={field.id}>
              <label htmlFor={field.id}>{field.label}</label>
              <input
                type="text"
                id={field.id}
                placeholder={field.placeholder}
                value={data[field.id]}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>
        
        {/* Calibration Sliders */}
        <div className="le-calibration-section">
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', margin: '0 0 6px 0', color: "var(--text-muted)", fontWeight: '700' }}>
            Main Table Calibration
          </h3>
          <div className="le-input-group">
            <label>Global X: <span>{calibration.x}</span></label>
            <input type="range" id="x" min="400" max="2500" value={calibration.x} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>Global Y: <span>{calibration.y}</span></label>
            <input type="range" id="y" min="50" max="1000" value={calibration.y} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>Row Spacing: <span>{calibration.spacing}</span></label>
            <input type="range" id="spacing" min="15" max="100" value={calibration.spacing} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>Font Size: <span>{calibration.fontSize}px</span></label>
            <input type="range" id="fontSize" min="10" max="60" value={calibration.fontSize} onChange={handleCalibrationChange} />
          </div>

          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', margin: '10px 0 6px 0', color: "var(--text-muted)", fontWeight: '700' }}>
            MRP Position (Independent)
          </h3>
          <div className="le-input-group">
            <label>MRP X: <span>{calibration.mrpX}</span></label>
            <input type="range" id="mrpX" min="400" max="2500" value={calibration.mrpX} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>MRP Y: <span>{calibration.mrpY}</span></label>
            <input type="range" id="mrpY" min="200" max="1500" value={calibration.mrpY} onChange={handleCalibrationChange} />
          </div>

          <div className="le-input-group" style={{ marginTop: '8px' }}>
            <label>Mask Style</label>
            <select id="maskStyle" value={calibration.maskStyle} onChange={handleCalibrationChange}>
              <option value="solid">Solid White (Clean Background)</option>
              <option value="stretch">Holographic Stretch</option>
              <option value="none">No Mask</option>
            </select>
          </div>

          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', margin: '10px 0 6px 0', color: "var(--text-muted)", fontWeight: '700' }}>
            QR & Code Position (Independent)
          </h3>
          <div className="le-input-group">
            <label>QR X: <span>{calibration.qrX}</span></label>
            <input type="range" id="qrX" min="800" max="2500" value={calibration.qrX} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>QR Y: <span>{calibration.qrY}</span></label>
            <input type="range" id="qrY" min="50" max="1500" value={calibration.qrY} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>QR Size: <span>{calibration.qrSize}</span></label>
            <input type="range" id="qrSize" min="50" max="1000" value={calibration.qrSize} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>Code X: <span>{calibration.codeX}</span></label>
            <input type="range" id="codeX" min="800" max="2500" value={calibration.codeX} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>Code Y: <span>{calibration.codeY}</span></label>
            <input type="range" id="codeY" min="200" max="1500" value={calibration.codeY} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>Code Font Size: <span>{calibration.codeFontSize}px</span></label>
            <input type="range" id="codeFontSize" min="10" max="60" value={calibration.codeFontSize} onChange={handleCalibrationChange} />
          </div>
        </div>
        
        {/* Actions */}
        <div className="le-actions-container">
          <button onClick={downloadPNG} className="le-btn le-btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Download PNG
          </button>
          <button onClick={downloadPDF} className="le-btn le-btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/>
            </svg>
            Download PDF
          </button>
        </div>

        <div className="le-settings-toggle">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" id="showDebug" checked={calibration.showDebug} onChange={handleCalibrationChange} /> Show Layout Debug Marks
          </label>
        </div>
      </div>
      
      {/* Live Preview Panel */}
      <div className={`le-preview-panel ${activeMobileTab === 'editor' ? 'hidden-mobile' : ''}`}>
        <div className="le-canvas-wrapper">
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  );
}
