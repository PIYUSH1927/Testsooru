import React, { useEffect, useRef, useState } from 'react';
import './ToolPanel.css';
import BuildToolsPanel from './BuildToolsPanel';

interface ToolPanelProps {
  activeTool: string;
  onClose: () => void;
}

const ToolPanel: React.FC<ToolPanelProps> = ({ activeTool, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedBuildTool, setSelectedBuildTool] = useState<string | null>(null);
  
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

  const handleBuildToolSelect = (toolId: string) => {
    setSelectedBuildTool(toolId);
  };

  if (!activeTool || activeTool === 'design') return null;

  const renderPanelContent = () => {
    switch (activeTool) {
      case 'build':
        return <BuildToolsPanel onSelectTool={handleBuildToolSelect} />;
      
      case 'project':
        return (
          <>
            <div className="panel-options">
              <p>Select a tool to begin</p>
            </div>
          </>
        );
      
      case 'info':
        return (
          <>
            <div className="panel-options">
              <p>Project information and details</p>
            </div>
          </>
        );
      
      case 'objects':
        return (
          <>
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
      
      case 'styleboards':
        return (
          <>
            <div className="panel-options">
              <p>Style options for your project</p>
            </div>
          </>
        );
      
      case 'exports':
        return (
          <>
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
      
      case 'help':
        return (
          <>
            <div className="panel-options">
              <p>Need help with something?</p>
              <ul className="help-links">
                <li><a href="#">Getting Started Guide</a></li>
                <li><a href="#">Video Tutorials</a></li>
                <li><a href="#">Keyboard Shortcuts</a></li>
                <li><a href="#">Contact Support</a></li>
              </ul>
            </div>
          </>
        );
      
      default:
        return <p>Select a tool to begin</p>;
    }
  };
  
  const getPanelTitle = () => {
    switch (activeTool) {
      case 'project': return 'Project';
      case 'build': return 'Build';
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