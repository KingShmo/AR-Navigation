import React, { useState, useEffect } from 'react';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';

const NetworkShareInfo: React.FC = () => {
  const [ipAddresses, setIpAddresses] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Get the server hostname and port from the window location
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Detect if running on localhost
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // If on localhost, try to get all local network IP addresses
    if (isLocalhost) {
      // Create mock addresses for development testing
      const testAddresses = [
        `http://${hostname}:${port}`,
        `http://192.168.1.100:${port}`,
        `http://10.0.0.100:${port}`
      ];
      
      setIpAddresses(testAddresses);
      setSelectedUrl(testAddresses[0]);
      
      // In a real implementation, you would use a server API or WebRTC to get actual network interfaces
      // For development, we're using mock data
      
      // Create QR code for the first address
      generateQrCodeUrl(testAddresses[0]);
    } else {
      // If not on localhost, just use the current URL
      const currentUrl = window.location.href;
      setIpAddresses([currentUrl]);
      setSelectedUrl(currentUrl);
      generateQrCodeUrl(currentUrl);
    }
  }, []);
  
  // Generate QR code URL using an external service
  const generateQrCodeUrl = (url: string) => {
    // Use Google Charts API to generate QR code
    const encodedUrl = encodeURIComponent(url);
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodedUrl}`;
    setQrCodeUrl(qrUrl);
  };
  
  // Handle URL selection change
  const handleUrlChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = e.target.value;
    setSelectedUrl(selectedUrl);
    generateQrCodeUrl(selectedUrl);
  };
  
  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedUrl)
      .then(() => {
        alert('URL copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <>
      <button 
        onClick={() => setShowInfo(!showInfo)}
        style={{
          position: 'fixed',
          top: '80px',
          right: '16px',
          backgroundColor: jpmcColors.primary,
          color: jpmcColors.white,
          border: 'none',
          borderRadius: jpmcThemeUI.borderRadius.md,
          padding: '8px 12px',
          fontWeight: 500,
          fontSize: '0.9rem',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: jpmcThemeUI.shadows.md
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>📱</span>
        Mobile Access
      </button>
      
      {showInfo && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: jpmcColors.white,
          padding: '20px',
          borderRadius: jpmcThemeUI.borderRadius.lg,
          boxShadow: jpmcThemeUI.shadows.xl,
          zIndex: 2000,
          maxWidth: '90%',
          width: '400px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              margin: 0,
              color: jpmcColors.secondary,
              fontSize: '1.4rem'
            }}>
              Access on Mobile Device
            </h3>
            <button
              onClick={() => setShowInfo(false)}
              style={{
                background: 'none',
                border: 'none',
                color: jpmcColors.textLight,
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              &times;
            </button>
          </div>
          
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: jpmcColors.backgroundDark,
            borderRadius: jpmcThemeUI.borderRadius.md
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: jpmcColors.textLight }}>
              To access this app on your mobile device, ensure your phone is connected to the same WiFi network, then scan this QR code or enter the URL manually:
            </p>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              {qrCodeUrl && (
                <div style={{ 
                  background: '#fff', 
                  padding: '12px', 
                  borderRadius: jpmcThemeUI.borderRadius.md, 
                  boxShadow: jpmcThemeUI.shadows.sm 
                }}>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for mobile access" 
                    style={{ width: '200px', height: '200px' }} 
                  />
                </div>
              )}
              
              <div style={{ width: '100%' }}>
                <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: jpmcColors.textLight }}>
                  Network URL:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={selectedUrl}
                    onChange={handleUrlChange}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: `1px solid ${jpmcColors.gray}`,
                      borderRadius: jpmcThemeUI.borderRadius.sm,
                      fontSize: '0.9rem'
                    }}
                  >
                    {ipAddresses.map((ip, index) => (
                      <option key={index} value={ip}>
                        {ip}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={copyToClipboard}
                    style={{
                      backgroundColor: jpmcColors.primary,
                      color: '#fff',
                      border: 'none',
                      borderRadius: jpmcThemeUI.borderRadius.sm,
                      padding: '8px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay when info is shown */}
      {showInfo && (
        <div 
          onClick={() => setShowInfo(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1999
          }}
        />
      )}
    </>
  );
};

export default NetworkShareInfo;
