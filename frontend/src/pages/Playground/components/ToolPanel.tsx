import React, { useEffect, useRef } from 'react';
import './ToolPanel.css';

interface ToolPanelProps {
  activeTool: string;
  onClose: () => void;
}

const ToolPanel: React.FC<ToolPanelProps> = ({ activeTool, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const positionPanel = () => {
    if (panelRef.current) {
      const activeItem = document.querySelector(`.toolbar-item`);
      if (activeItem) {
        const activeRect = activeItem.getBoundingClientRect();
        panelRef.current.style.top = `${activeRect.top}px`;
      }
    }
  };

  useEffect(() => {
    positionPanel();
  }, [activeTool]);

  useEffect(() => {
    window.addEventListener('resize', positionPanel);
    return () => {
      window.removeEventListener('resize', positionPanel);
    };
  }, []);

  if (!activeTool || activeTool === 'design') return null;

  const renderPanelContent = () => {
    switch (activeTool) {
      case 'measure':
        return (
          <>
            <h3>Measurement Tools</h3>
            <div className="panel-options">
              <button>Distance</button>
              <button>Area</button>
              <button>Angle</button>
            </div>
          </>
        );
      case 'furniture':
        return (
          <>
            <h3>Furniture</h3>
            <div className="panel-options furniture-options">
              <div className="furniture-item">
                <div className="furniture-icon">🛋️</div>
                <span>Sofa</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🛏️</div>
                <span>Bed</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🪑</div>
                <span>Chair</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🪟</div>
                <span>Window</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🚪</div>
                <span>Door</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🍽️</div>
                <span>Table</span>
              </div>
            </div>
          </>
        );
      case 'walls':
        return (
          <>
            <h3>Wall Tools</h3>
            <div className="panel-options">
              <button>Add Wall</button>
              <button>Remove Wall</button>
              <button>Move Wall</button>
              <div className="slider-control">
                <label>Wall Thickness</label>
                <input type="range" min="1" max="10" defaultValue="5" />
              </div>
            </div>
          </>
        );
      case 'windows':
        return (
          <>
            <h3>Window Tools</h3>
            <div className="panel-options">
              <button>Add Window</button>
              <button>Remove Window</button>
              <div className="slider-control">
                <label>Window Width</label>
                <input type="range" min="1" max="10" defaultValue="5" />
              </div>
            </div>
          </>
        );
      case 'doors':
        return (
          <>
            <h3>Door Tools</h3>
            <div className="panel-options">
              <button>Add Door</button>
              <button>Remove Door</button>
              <div className="select-control">
                <label>Door Type</label>
                <select>
                  <option>Standard</option>
                  <option>Sliding</option>
                  <option>Folding</option>
                  <option>Double</option>
                </select>
              </div>
            </div>
          </>
        );
      case 'colors':
        return (
          <>
            <h3>Color Tools</h3>
            <div className="panel-options">
              <div className="color-selector">
                <label>Wall Color</label>
                <div className="color-choices">
                  <div className="color-choice" style={{ backgroundColor: '#f8f9fa' }}></div>
                  <div className="color-choice" style={{ backgroundColor: '#e9ecef' }}></div>
                  <div className="color-choice" style={{ backgroundColor: '#dee2e6' }}></div>
                  <div className="color-choice" style={{ backgroundColor: '#ced4da' }}></div>
                </div>
              </div>
              <div className="color-selector">
                <label>Floor Color</label>
                <div className="color-choices">
                  <div className="color-choice" style={{ backgroundColor: '#d4a373' }}></div>
                  <div className="color-choice" style={{ backgroundColor: '#e9c46a' }}></div>
                  <div className="color-choice" style={{ backgroundColor: '#ccd5ae' }}></div>
                  <div className="color-choice" style={{ backgroundColor: '#faedcd' }}></div>
                </div>
              </div>
            </div>
          </>
        );
      case 'export':
        return (
          <>
            <h3>Export Options</h3>
            <div className="panel-options">
              <button className="export-button">PNG Image</button>
              <button className="export-button">PDF Document</button>
              <button className="export-button">CAD File</button>
              <div className="checkbox-control">
                <input type="checkbox" id="include-measurements" />
                <label htmlFor="include-measurements">Include Measurements</label>
              </div>
              <div className="checkbox-control">
                <input type="checkbox" id="include-furniture" />
                <label htmlFor="include-furniture">Include Furniture</label>
              </div>
            </div>
          </>
        );
      case 'project':
        return (
          <>
            <h3>Project Tools</h3>
            <div className="panel-options">
              <p>Select a tool to begin</p>
            </div>
          </>
        );
      case 'build':
        return (
          <>
            <h3>Build Tools</h3>
            <div className="panel-options">
              <p>Select a tool to begin</p>
            </div>
          </>
        );
      case 'objects':
        return (
          <>
            <h3>Objects Library</h3>
            <div className="panel-options furniture-options">
              <div className="furniture-item">
                <div className="furniture-icon">🛋️</div>
                <span>Sofa</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🛏️</div>
                <span>Bed</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🪑</div>
                <span>Chair</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🪟</div>
                <span>Window</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🚪</div>
                <span>Door</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-icon">🍽️</div>
                <span>Table</span>
              </div>
            </div>
          </>
        );
      default:
        return <p>Select a tool to begin</p>;
    }
  };
  
  const getPanelTitle = () => {
    switch (activeTool) {
      case 'project': return 'Project Tools';
      case 'build': return 'Build Tools';
      case 'info': return 'Information';
      case 'objects': return 'Objects';
      case 'styleboards': return 'Styleboards';
      case 'finishes': return 'Finishes';
      case 'exports': return 'Exports';
      case 'help': return 'Help';
      case 'colors': return 'Colors';
      default: return `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Tools`;
    }
  };

  return (
    <div className="tool-panel" ref={panelRef}>
      <div className="panel-header">
        <h2>{getPanelTitle()}</h2>
        <button className="close-panel" onClick={onClose}>×</button>
      </div>
      <div className="panel-content">
        {renderPanelContent()}
      </div>
    </div>
  );
};

export default ToolPanel;