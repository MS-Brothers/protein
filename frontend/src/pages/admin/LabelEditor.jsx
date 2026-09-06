import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import ThemeToggle from '../../components/ThemeToggle';
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

const TEMPLATE_SRC = '/label-editor/template.jpeg?v=no_qr_clean';

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
    mrp: ''
  });

  const [calibration, setCalibration] = useState({
    x: 1132,
    y: 304,
    spacing: 47,
    fontSize: 27,
    mrpX: 1191,
    mrpY: 736,
    maskStyle: 'stretch',
    showDebug: false
  });

  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const img = imageRef.current;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      img.src = getApiUrl('/uploads/templates/template.jpeg');
    };
    img.src = TEMPLATE_SRC;

    if (img.complete && img.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      renderCanvas();
    }
  }, [data, calibration, imageLoaded]);

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

  const applyMask = (ctx, img, x, y, w, style) => {
    const maskX = x - 10;
    const maskY = y - 22;
    const maskH = 28;
    const maskW = Math.max(w, 260);

    if (style === 'solid') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(maskX, maskY, maskW, maskH);
    } else if (style === 'stretch') {
      const sourceX = Math.max(0, maskX - 25);
      const sourceY = maskY;
      ctx.drawImage(
        img, 
        sourceX, sourceY, 15, maskH, 
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
    const { x: startX, y: startY, spacing, fontSize, mrpX, mrpY, maskStyle } = calibration;

    fieldsList.forEach((field, index) => {
      const val = data[field.id];
      
      let posX = startX;
      let posY = startY + (index * spacing);
      let maskWidth = 220; 
      
      if (field.id === 'mrp') {
        posX = mrpX;
        posY = mrpY;
        maskWidth = 90;
      }

      if (maskStyle !== 'none') {
        applyMask(ctx, img, posX, posY, maskWidth, maskStyle);
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
            <input type="range" id="x" min="800" max="1300" value={calibration.x} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>Global Y: <span>{calibration.y}</span></label>
            <input type="range" id="y" min="150" max="400" value={calibration.y} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>Row Spacing: <span>{calibration.spacing}</span></label>
            <input type="range" id="spacing" min="30" max="60" value={calibration.spacing} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>Font Size: <span>{calibration.fontSize}px</span></label>
            <input type="range" id="fontSize" min="10" max="40" value={calibration.fontSize} onChange={handleCalibrationChange} />
          </div>

          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', margin: '10px 0 6px 0', color: "var(--text-muted)", fontWeight: '700' }}>
            MRP Position (Independent)
          </h3>
          <div className="le-input-group">
            <label>MRP X: <span>{calibration.mrpX}</span></label>
            <input type="range" id="mrpX" min="800" max="1300" value={calibration.mrpX} onChange={handleCalibrationChange} />
          </div>
          <div className="le-input-group">
            <label>MRP Y: <span>{calibration.mrpY}</span></label>
            <input type="range" id="mrpY" min="400" max="900" value={calibration.mrpY} onChange={handleCalibrationChange} />
          </div>

          <div className="le-input-group" style={{ marginTop: '8px' }}>
            <label>Mask Style</label>
            <select id="maskStyle" value={calibration.maskStyle} onChange={handleCalibrationChange}>
              <option value="solid">Solid White (Clean Background)</option>
              <option value="stretch">Holographic Stretch</option>
              <option value="none">No Mask</option>
            </select>
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
