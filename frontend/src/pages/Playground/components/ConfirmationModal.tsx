import React from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDontSave: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onSave,
  onDontSave,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-modal-header">
          <h2>Unsaved Changes</h2>
          <button className="confirmation-close-btn" onClick={onCancel}>
            ✖
          </button>
        </div>
        <div className="confirmation-modal-body">
          <p>Save changes to the floor plan before leaving?</p>
        </div>
        <div className="confirmation-modal-actions">
          <button className="confirmation-save-btn" onClick={onSave}>
            Save
          </button>
          <button className="confirmation-dont-save-btn" onClick={onDontSave}>
            Don't Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;