import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";

const statusOptions = [
  { label: "Not Started", value: "not-started" },
  { label: "In Progress", value: "in-progress" },
  { label: "On Hold", value: "on-hold" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const EditStatusModal = ({ isOpen, onClose, currentStatus, id, handleUpdateProjectStatus }) => {
  const { updateStatusApi } = useProjectStore();
  const [status, setStatus] = useState(currentStatus ?? "not-started");

  const handleStatusUpdate = async () => {
    await updateStatusApi(id, status);
    handleUpdateProjectStatus(id, status);
    onClose();
  };

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h2 className="text-lg font-semibold mb-4">Edit Project Status</h2>
        
        <select
          className="select select-bordered w-full mb-4 focus:outline-none"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleStatusUpdate}>Save</button>
        </div>
      </div>
      
      {/* Backdrop click handler */}
      <form method="dialog" className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
};

export default EditStatusModal;
