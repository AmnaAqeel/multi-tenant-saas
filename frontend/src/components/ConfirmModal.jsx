// components/ConfirmModal.jsx
import React from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description, confirmText = "Confirm" }) => {
  return (
    <>
      <input type="checkbox" id="confirm-modal" className="modal-toggle" checked={isOpen} readOnly />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="py-4">{description}</p>
          <div className="modal-action">
            <button onClick={onClose} className="btn btn-outline">Cancel</button>
            <button onClick={onConfirm} className="btn btn-error">{confirmText}</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
