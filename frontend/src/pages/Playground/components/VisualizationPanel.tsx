import React, { useEffect, useRef } from 'react';
import { useFloorPlan, VisualizationOptions } from '../FloorPlanContext';
import './VisualizationPanel.css';

interface VisualizationPanelProps {
  onClose: () => void;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ onClose }) => {
  const { visualizationOptions, updateVisualizationOption, resetVisualizationOptions } = useFloorPlan();
  const panelRef = useRef<HTMLDivElement>(null);

  const blockAllEvents = (e: React.MouseEvent | React.WheelEvent) => {
    e.stopPropagation();
  };

  const blockWheelEvents = (e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault(); 
  };
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
    };

    panel.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      panel.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleToggle = (option: keyof VisualizationOptions) => {
    if (typeof visualizationOptions[option] === 'boolean') {
      updateVisualizationOption(
        option,
        !visualizationOptions[option] as any
      );
    }
  };

  const handleSliderChange = (option: keyof VisualizationOptions, value: number) => {
    updateVisualizationOption(option, value as any);
  };

  const handleSelectChange = (option: keyof VisualizationOptions, value: string) => {
    updateVisualizationOption(option, value as any);
  };

  const handleColorSampleClick = (colorScheme: string) => {
    handleSelectChange('colorScheme', colorScheme as any);
  };

  return (
    <div 
      ref={panelRef}
      className="visualization-panel"
      onMouseDown={blockAllEvents}
      onMouseMove={blockAllEvents}
      onMouseUp={blockAllEvents}
      onClick={blockAllEvents}
      onDoubleClick={blockAllEvents} 
      onWheel={blockWheelEvents}
    >
      <div className="panel-header">
        <h2>Visualization Options</h2>
        <button className="close-panel" onClick={(e) => {
          blockAllEvents(e);
          onClose();
        }}>×</button>
      </div>
      
      <div className="panel-content">
        <div className="options-section">
          <h3>Display Options</h3>
          
          <div className="toggle-option">
            <label>
              <input
                type="checkbox"
                checked={visualizationOptions.showMeasurements}
                onChange={() => handleToggle('showMeasurements')}
              />
              Show Measurements
            </label>
          </div>
          
          <div className="toggle-option">
            <label>
              <input
                type="checkbox"
                checked={visualizationOptions.showRoomLabels}
                onChange={() => handleToggle('showRoomLabels')}
              />
              Show Room Labels
            </label>
          </div>
          
        </div>
        
        <div className="options-section">
          <h3>Wall Thickness</h3>
          <div className="slider-option">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={visualizationOptions.wallThickness}
              onChange={(e) => handleSliderChange('wallThickness', parseInt(e.target.value))}
              onWheel={blockWheelEvents}
            />
            <span className="slider-value">{visualizationOptions.wallThickness}px</span>
            
            <div 
              className="thickness-preview" 
              style={{
                height: '14px',
                width: '40px',
                border: `${visualizationOptions.wallThickness}px solid black`,
                display: 'inline-block',
                marginLeft: '10px',
                borderRadius: '2px'
              }}
            ></div>
          </div>
        </div>
        
        <div className="options-section">
          <h3>Color Scheme</h3>
          <div className="select-option">
            <select
              value={visualizationOptions.colorScheme}
              onChange={(e) => handleSelectChange('colorScheme', e.target.value as any)}
            >
              <option value="standard">Standard</option>
              <option value="monochrome">Monochrome</option>
              <option value="pastel">Pastel</option>
              <option value="contrast">High Contrast</option>
            </select>
          </div>
          
          <div className="color-preview">
            <div 
              className={`color-sample standard ${visualizationOptions.colorScheme === 'standard' ? 'selected' : ''}`}
              title="Standard"
              onClick={(e) => {
                blockAllEvents(e);
                handleColorSampleClick('standard');
              }}
            ></div>
            <div 
              className={`color-sample monochrome ${visualizationOptions.colorScheme === 'monochrome' ? 'selected' : ''}`}
              title="Monochrome"
              onClick={(e) => {
                blockAllEvents(e);
                handleColorSampleClick('monochrome');
              }}
            ></div>
            <div 
              className={`color-sample pastel ${visualizationOptions.colorScheme === 'pastel' ? 'selected' : ''}`}
              title="Pastel"
              onClick={(e) => {
                blockAllEvents(e);
                handleColorSampleClick('pastel');
              }}
            ></div>
            <div 
              className={`color-sample contrast ${visualizationOptions.colorScheme === 'contrast' ? 'selected' : ''}`}
              title="High Contrast"
              onClick={(e) => {
                blockAllEvents(e);
                handleColorSampleClick('contrast');
              }}
            ></div>
          </div>
        </div>
        
        <div className="options-actions">
          <button 
            className="reset-button" 
            onClick={(e) => {
              blockAllEvents(e);
              resetVisualizationOptions();
            }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPanel;