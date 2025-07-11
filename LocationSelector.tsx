import { useState } from 'react';
import { jpmcColors } from './jpmcTheme';

interface LocationSelectorProps {
  onDestinationChange: (location: string, etaSeconds: number) => void;
  currentLocation?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onDestinationChange, 
  currentLocation = "Meeting Room A"
}) => {
  const [selected, setSelected] = useState(currentLocation);
    const locations = [
    { name: "Meeting Room A", etaSeconds: 222 },
    { name: "Executive Office", etaSeconds: 305 },
    { name: "Cafeteria", etaSeconds: 178 },
    { name: "Innovation Lab", etaSeconds: 254 },
    { name: "Starbucks", etaSeconds: 254 }
  ];
  
  const handleLocationChange = (locationName: string) => {
    setSelected(locationName);
    const location = locations.find(l => l.name === locationName);
    if (location) {
      onDestinationChange(location.name, location.etaSeconds);
    }
  };
  
  return (
    <div style={{ 
      backgroundColor: jpmcColors.background, 
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px'
    }}>
      <h3 style={{ 
        color: jpmcColors.secondary,
        marginTop: 0,
        marginBottom: '12px'
      }}>
        Select Destination
      </h3>
      
      <div style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center'
      }}>
        {locations.map(location => (
          <button
            key={location.name}
            onClick={() => handleLocationChange(location.name)}
            style={{ 
              backgroundColor: selected === location.name 
                ? jpmcColors.primary 
                : jpmcColors.white,
              color: selected === location.name 
                ? jpmcColors.white 
                : jpmcColors.secondary,
              border: `1px solid ${jpmcColors.primary}`,
              borderRadius: '6px',
              padding: '8px 16px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {location.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LocationSelector;
