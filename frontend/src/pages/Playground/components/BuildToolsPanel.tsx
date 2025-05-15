import React, { useState, useEffect } from 'react';
import './BuildToolsPanel.css';
import { useFloorPlan } from '../FloorPlanContext';
import { BuildTool } from '../features/types';

interface BuildToolsProps {
  onSelectTool: (tool: string) => void;
}

const BuildToolsPanel: React.FC<BuildToolsProps> = ({ onSelectTool }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { 
    setActiveBuildTool, 
    activeBuildTool, 
    setIsDrawingActive,
    visualizationOptions,
    drawingWallWidth,
    setDrawingWallWidth
  } = useFloorPlan();
  
  useEffect(() => {
    setIsDrawingActive(false);
  }, [activeBuildTool, setIsDrawingActive]);
  
  const buildTools = [
    { id: 'drawRoom', label: 'Draw Room', icon: '📦' },
    { id: 'drawWall', label: 'Draw Wall', icon: '🧱' },
    { id: 'placeDoors', label: 'Place Doors', icon: '🚪', hasSubmenu: true },
    { id: 'placeWindows', label: 'Place Windows', icon: '🪟', hasSubmenu: true },
  ];
  
  const doorTypes = [
    { id: 'standard', label: 'Standard Door', icon: <div className="door-icon standard-door"></div> },
    { id: 'sliding', label: 'Sliding Door', icon: <div className="door-icon sliding-door"></div> },
    { id: 'double', label: 'Double Door', icon: <div className="door-icon double-door"></div> },
    { id: 'pocket', label: 'Pocket Door', icon: <div className="door-icon pocket-door"></div> },
  ];
  
  const windowTypes = [
    { id: 'standard', label: 'Standard Window', icon: <span style={{ marginRight: '12px' }}>🪟</span> },
    { id: 'large', label: 'Large Window', icon: <span style={{ marginRight: '12px' }}>🪟</span> },
    { id: 'bay', label: 'Bay Window', icon: <span style={{ marginRight: '12px' }}>🪟</span> },
    { id: 'corner', label: 'Corner Window', icon: <span style={{ marginRight: '12px' }}>🪟</span> },
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'placeDoors') {
      setActiveSubmenu('doors');
      setSelectedType(null);
      setActiveBuildTool(null);
      setDrawingWallWidth(5); 
    } else if (toolId === 'placeWindows') {
      setActiveSubmenu('windows');
      setSelectedType(null);
      setActiveBuildTool(null);
      setDrawingWallWidth(5); 
    } else {
      if (toolId !== 'drawWall') {
        setDrawingWallWidth(5); 
      }
      onSelectTool(toolId);
      setActiveBuildTool(toolId as BuildTool);
    }
  };

  const handleBackFromSubmenu = () => {
    if (selectedType) {
      setSelectedType(null);
    } else {
      setActiveSubmenu(null);
      setActiveBuildTool(null);
    }
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };
  
  const handlePlacement = () => {
    if (activeSubmenu && selectedType) {
      const toolId = `${activeSubmenu}-${selectedType}`;
      onSelectTool(toolId);
      setActiveBuildTool(toolId as BuildTool);
    }
  };

  const adjustWallWidth = (delta: number) => {
    const newWidth = Math.max(1, Math.min(10, drawingWallWidth + delta));
    setDrawingWallWidth(newWidth);
  };
  
  if (activeSubmenu === 'doors' && selectedType) {
    const selectedDoor = doorTypes.find(door => door.id === selectedType);
    
    return (
      <div className="door-placement-panel">
        <div className="submenu-header">
          <button className="back-button" onClick={handleBackFromSubmenu}>← Back</button>
          {selectedDoor?.icon}
          <span className="submenu-title">{selectedDoor?.label}</span>
        </div>
        
        <div className="">
          <h3>Placement Options</h3>
          
          <div className="option-group">
            <label>Size:</label>
            <select className="size-select">
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
          
          <div className="option-group">
            <label>Style:</label>
            <select className="style-select">
              <option>Modern</option>
              <option>Classic</option>
              <option>Traditional</option>
            </select>
          </div>
          
          <div className="action-buttons">
            <button className="cancel-button" onClick={handleBackFromSubmenu}>Cancel</button>
            <button className="place-button" onClick={handlePlacement}>Place Door</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (activeSubmenu === 'windows' && selectedType) {
    const selectedWindow = windowTypes.find(window => window.id === selectedType);
    
    return (
      <div className="window-placement-panel">
        <div className="submenu-header">
          <button className="back-button" onClick={handleBackFromSubmenu}>← Back</button>
          {selectedWindow?.icon}
          <span className="submenu-title">{selectedWindow?.label}</span>
        </div>
    
        <div>
          <h3>Placement Options</h3>
          
          <div className="option-group">
            <label>Size:</label>
            <select className="size-select">
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
          
          <div className="option-group">
            <label>Style:</label>
            <select className="style-select">
              <option>Modern</option>
              <option>Classic</option>
              <option>Traditional</option>
            </select>
          </div>
          
          <div className="action-buttons">
            <button className="cancel-button" onClick={handleBackFromSubmenu}>Cancel</button>
            <button className="place-button" onClick={handlePlacement}>Place Window</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (activeSubmenu === 'doors') {
    return (
      <div className="door-types-submenu">
        <div className="submenu-header">
          <button className="back-button" onClick={handleBackFromSubmenu}>← Back</button>
          <span className="submenu-title"><b>Door Types</b></span>
        </div>
        
        <div className="door-types-list">
          {doorTypes.map(door => (
            <div key={door.id} className="door-type-item" onClick={() => handleTypeSelect(door.id)}>
              {door.icon}
              <span className="door-type-label">{door.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (activeSubmenu === 'windows') {
    return (
      <div className="window-types-submenu">
        <div className="submenu-header">
          <button className="back-button" onClick={handleBackFromSubmenu}>← Back</button>
          <span className="submenu-title"><b>Window Types</b></span>
        </div>
        
        <div className="window-types-list">
          {windowTypes.map(window => (
            <div key={window.id} className="window-type-item" onClick={() => handleTypeSelect(window.id)}>
              {window.icon}
              <span className="window-type-label">{window.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="build-tools-panel">
      {buildTools.map((tool) => (
        <div 
          key={tool.id}
          className={`build-tool-item ${activeBuildTool === tool.id ? 'active' : ''}`}
          onClick={() => handleToolClick(tool.id)}
        >
          <div className="build-tool-icon">
            {tool.id === 'drawRoom' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 14H5V5h14v14z" fill="currentColor"/>
              </svg>
            )}
            {tool.id === 'drawWall' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 3H3v18h18V3zM11 19H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" fill="currentColor"/>
              </svg>
            )}
            {tool.id === 'placeDoors' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 19V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v14H3v2h18v-2h-2zm-6 0H7V5h6v14zm4-8h2v2h-2v-2z" fill="currentColor"/>
              </svg>
            )}
            {tool.id === 'placeWindows' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 8h-6V5h6v6zm-8-6v6H5V5h6zm-6 8h6v6H5v-6zm8 6v-6h6v6h-6z" fill="currentColor"/>
              </svg>
            )}
          </div>
          <div className="build-tool-label">{tool.label}</div>
          {tool.hasSubmenu && <div className="submenu-indicator">›</div>}
        </div>
      ))}
      
      {activeBuildTool === 'drawWall' && (
        <div className="wall-width-control">
          <h4>Wall Width</h4>
          <div className="wall-width-adjuster">
            <button 
              className="wall-width-button"
              onClick={() => adjustWallWidth(-1)}
              disabled={drawingWallWidth <= 1}
            >
              -
            </button>
            <div className="wall-width-display">
              {drawingWallWidth}px
            </div>
            <button 
              className="wall-width-button"
              onClick={() => adjustWallWidth(1)}
              disabled={drawingWallWidth >= 10}
            >
              +
            </button>
          </div>
          <div className="wall-preview">
            <div 
              className="wall-preview-line"
              style={{ height: `${drawingWallWidth}px` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildToolsPanel;