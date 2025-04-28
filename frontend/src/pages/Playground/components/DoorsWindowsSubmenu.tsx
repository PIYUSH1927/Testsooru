import React from 'react';
import './DoorsWindowsSubmenu.css';

interface SubmenuProps {
  type: 'doors' | 'windows';
  onBack: () => void;
  onSelectOption: (option: string) => void;
}

const DoorsWindowsSubmenu: React.FC<SubmenuProps> = ({ type, onBack, onSelectOption }) => {
  const doorOptions = [
    { id: 'standard', label: 'Standard Door', icon: '🚪' },
    { id: 'sliding', label: 'Sliding Door', icon: '↔️' },
    { id: 'double', label: 'Double Door', icon: '🚪🚪' },
    { id: 'pocket', label: 'Pocket Door', icon: '⤵️' },
  ];

  const windowOptions = [
    { id: 'standard', label: 'Standard Window', icon: '🪟' },
    { id: 'large', label: 'Large Window', icon: '🪟🪟' },
    { id: 'bay', label: 'Bay Window', icon: '🪟' },
    { id: 'corner', label: 'Corner Window', icon: '⬦' },
  ];

  const options = type === 'doors' ? doorOptions : windowOptions;
  
  return (
    <div className="submenu-container">
      <div className="submenu-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h3>{type === 'doors' ? 'Door Types' : 'Window Types'}</h3>
      </div>
      
      <div className="submenu-options">
        {options.map(option => (
          <div 
            key={option.id}
            className="submenu-option"
            onClick={() => onSelectOption(`${type}-${option.id}`)}
          >
            <span className="option-icon">{option.icon}</span>
            <span className="option-label">{option.label}</span>
          </div>
        ))}
      </div>
      
      <div className="placement-controls">
        <h4>Placement Options</h4>
        <div className="control-group">
          <label>
            Size:
            <select>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </label>
        </div>
        <div className="control-group">
          <label>
            Style:
            <select>
              <option>Modern</option>
              <option>Classic</option>
              <option>Minimalist</option>
            </select>
          </label>
        </div>
        <div className="control-actions">
          <button className="cancel-button">Cancel</button>
          <button className="place-button">Place {type === 'doors' ? 'Door' : 'Window'}</button>
        </div>
      </div>
    </div>
  );
};

export default DoorsWindowsSubmenu;