import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div 
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        borderRadius: '20px',
        background: isDark ? '#334155' : '#e2e8f0',
        cursor: 'pointer',
        gap: '8px',
        transition: 'all 0.3s ease',
        userSelect: 'none'
      }}
    >
      <span style={{ fontSize: '14px', filter: isDark ? 'grayscale(1)' : 'none' }}>☀️</span>
      <div style={{
        width: '30px',
        height: '16px',
        background: isDark ? '#3b82f6' : '#cbd5e1',
        borderRadius: '10px',
        position: 'relative',
        transition: 'background 0.3s'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          background: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: isDark ? '16px' : '2px',
          transition: 'all 0.3s'
        }} />
      </div>
      <span style={{ fontSize: '14px', filter: !isDark ? 'grayscale(1)' : 'none' }}>🌙</span>
    </div>
  );
}

export default ThemeToggle;
