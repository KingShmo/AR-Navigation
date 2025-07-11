import React, { useState, useEffect } from 'react';
import GoogleStyleARView from './GoogleStyleARView';
import { jpmcColors } from './jpmcTheme';

interface TestARViewProps {
    destination?: string;
    eta?: number;
    distance?: number;
    direction?: 'forward' | 'left' | 'right' | 'stairs' | 'elevator';
    onToggleViewMode?: () => void;
}

const TestARView: React.FC<TestARViewProps> = ({
    destination = "Meeting Room",
    eta = 180,
    distance = 60,
    direction = "forward",
    onToggleViewMode
}) => {  
    const [isActive, setIsActive] = useState(true); // Start with camera active for first person view
    
    // Auto-activate camera when component mounts
    useEffect(() => {
        console.log("TestARView mounted, activating camera");
        // Short delay before activating camera
        const timer = setTimeout(() => {
            setIsActive(true);
        }, 500);
        
        return () => clearTimeout(timer);
    }, []);    return (
        <div>
            <div style={{
                position: 'relative',
                height: '100%',
                width: '100%',
                overflow: 'hidden'
            }}>
                <GoogleStyleARView
                    active={isActive}
                    direction={direction}
                    destination={destination}
                    eta={eta}
                    distance={distance}
                    onCameraReady={() => console.log('Camera ready')}
                    onCameraError={(error) => console.error('Camera error:', error)}
                    isDarkMode={false}
                    onToggleViewMode={onToggleViewMode}
                />
                
                {!isActive && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f0f0f0',
                        color: '#1A73E8',
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div>Camera Inactive</div>
                            <button
                                onClick={() => setIsActive(true)}
                                style={{
                                    backgroundColor: jpmcColors.primary,
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginTop: '20px'
                                }}
                            >
                                Activate Camera
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestARView;
