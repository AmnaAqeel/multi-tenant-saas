import { useState } from "react";
import { useInviteStore } from "../store/useInviteStore";
import { ButtonLoader } from "./Loader";

export default function InviteUserModal({ isOpen, onClose }) {
  const { InviteUser, isSendingInvite } = useInviteStore();
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member",
  });

  const [message, setMessage] = useState(null);

  const handleInvite = async () => {
    setMessage(null);
    try {
      const response = await InviteUser(inviteData);
      if (response) {
        setMessage({ type: "success", text: "Invite sent successfully!" });
        setInviteData({
          email: "",
          role: "member",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Error sending invite.",
      });
    }
  };

  return (
    <dialog
      id="invite_user_modal"
      className={`modal ${isOpen ? "modal-open" : ""}`}
    >
      <div className="modal-box w-full max-w-md">
        <h3 className="text-lg font-bold">Invite a New Team Member</h3>
        <p className="text-base-content/70 mt-1 text-sm">
          Enter the user's email and assign a role for this company.
        </p>

        {/* Email Input */}
        <div className="mt-4">
          <label className="label">
            <span className="label-text">User Email</span>
          </label>
          <input
            type="email"
            placeholder="e.g. team@company.com"
            className="input input-bordered w-full focus:outline-none"
            value={inviteData.email}
            onChange={(e) =>
              setInviteData({ ...inviteData, email: e.target.value })
            }
          />
        </div>

        {/* Role Selector */}
        <div className="mt-4">
          <label className="label">
            <span className="label-text">Assign Role</span>
          </label>
          <select
            className="select select-bordered w-full focus:outline-none"
            value={inviteData.role}
            onChange={(e) =>
              setInviteData({ ...inviteData, role: e.target.value })
            }
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="member">Member</option>
          </select>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-3 text-sm ${
              message.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            disabled={isSendingInvite || !inviteData.email}
            onClick={handleInvite}
          >
            {isSendingInvite ? <ButtonLoader /> : "Send Invite"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
