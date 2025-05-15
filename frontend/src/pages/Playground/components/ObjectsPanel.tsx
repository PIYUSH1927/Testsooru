import React from 'react';
import './ToolPanel.css';

interface ObjectsPanelProps {
  onSelectObject?: (objectId: string) => void;
}

interface FurnitureItem {
  id: string;
  icon: string;
  label: string;
}

const furnitureItems: FurnitureItem[] = [
  { id: 'sofa', icon: '🛋️', label: 'Sofa' },
  { id: 'bed', icon: '🛏️', label: 'Bed' },
  { id: 'chair', icon: '🪑', label: 'Chair' },
  { id: 'window', icon: '🪟', label: 'Window' },
  { id: 'door', icon: '🚪', label: 'Door' },
  { id: 'table', icon: '🍽️', label: 'Table' },
];

const ObjectsPanel: React.FC<ObjectsPanelProps> = ({ onSelectObject }) => {
  const handleObjectSelect = (objectId: string) => {
    // Handle object selection logic here
    console.log(`Object selected: ${objectId}`);
    
    if (onSelectObject) {
      onSelectObject(objectId);
    }
  };

  return (
    <div className="panel-options furniture-options" style={{
      userSelect: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      msUserSelect: "none",
    }}>
      {furnitureItems.map((item) => (
        <div 
          key={item.id}
          className="furniture-item"
          onClick={() => handleObjectSelect(item.id)}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.setData('objectType', item.id);
            e.currentTarget.classList.add('dragging');
          }}
          onDragEnd={(e) => {
            e.currentTarget.classList.remove('dragging');
          }}
        >
          <div className="furniture-icon">{item.icon}</div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ObjectsPanel;