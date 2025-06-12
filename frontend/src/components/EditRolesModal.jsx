
import { useState } from "react";

const roles = ["admin", "editor", "member"];

const EditRolesModal = ({ members, onClose, onSubmit }) => {
  const [updated, setUpdated] = useState(
    members.map((user) => ({
      ...user,
      newRole: user.role,
    }))
  );

  const handleChange = (userId, role) => {
    setUpdated((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, newRole: role } : u
      )
    );
  };

  const handleSave = () => {
    const changed = updated
      .filter((u) => u.newRole !== u.role)
      .map((u) => ({ userId: u.id, newRole: u.newRole }));

    onSubmit(changed);
  };

  return (
    <dialog id="edit_roles_modal" className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold mb-4">Manage Member Roles</h3>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {updated.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-x-2 ">
              <span>{user.email}</span>
              <select
                className="select select-sm select-bordered focus:outline-none"
                value={user.newRole}
                onChange={(e) => handleChange(user.id, e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default EditRolesModal;
