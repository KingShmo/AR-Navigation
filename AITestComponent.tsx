import React from 'react';
import AIAssistant from './AIAssistant';
import { jpmcColors } from './jpmcTheme';

const AITestComponent: React.FC = () => {
  // Test values for demonstration
  const testDestination = 'Meeting Room A';
  const testNavMode = 'walking';
  const testEtaSeconds = 222;
  const testIsDarkMode = false;
  
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: jpmcColors.background,
      minHeight: '100vh'
    }}>
      <h1 style={{ color: jpmcColors.primary }}>AI Assistant Test Component</h1>
      <p style={{ marginBottom: '30px' }}>This component tests the AI Assistant in isolation.</p>
      
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        <div>
          <h2>Regular Mode</h2>
          <AIAssistant
            destination={testDestination}
            navMode={testNavMode}
            etaSeconds={testEtaSeconds}
            isDarkMode={testIsDarkMode}
            isARMode={false}
          />
        </div>
        
        <div>
          <h2>AR Mode (Floating Panel)</h2>
          <div style={{ 
            position: 'relative', 
            height: '500px',
            border: `1px solid ${jpmcColors.gray}`,
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '20px',
              color: jpmcColors.textLight
            }}>
              AR View Simulation
            </div>
            <AIAssistant
              destination="Executive Office"
              navMode="elevator"
              etaSeconds={305}
              isDarkMode={false}
              isARMode={true}
            />
          </div>
        </div>
        
        <div>
          <h2>Dark Mode</h2>
          <div style={{ 
            backgroundColor: jpmcColors.dark,
            padding: '20px',
            borderRadius: '8px'
          }}>
            <AIAssistant
              destination="Cafeteria"
              navMode="wheelchair"
              etaSeconds={178}
              isDarkMode={true}
              isARMode={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITestComponent;
