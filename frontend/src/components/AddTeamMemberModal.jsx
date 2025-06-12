import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useAuthStore } from "../store/useAuthStore";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

const AddTeamMemberModal = ({
  isOpen,
  onClose,
  companyUsers = [],
  projectId,
  projectTeamMembers = [],
  onMemberAdded,
}) => {
  const { addTeamMembersApi } = useProjectStore();
  const rolesMap = {
    "project-manager": "Project Manager",
    designer: "Designer",
    developer: "Developer",
    qa: "Quality Assurant",
    "business-analyst": "Business Analyst",
    devops: "DevOps",
    "product-owner": "Product Owner",
    "scrum-master": "Scrum Master",
  };
  const roles = Object.keys(rolesMap);

  const [selectedMembers, setSelectedMembers] = useState({});

  const toggleSelection = (userId) => {
    setSelectedMembers((prev) => {
      const updated = { ...prev };
      if (updated[userId]) {
        delete updated[userId];
      } else {
        updated[userId] = ""; // Empty role until selected
      }
      return updated;
    });
  };

  const alreadyAssignedIds = new Set(
    projectTeamMembers.map((member) => member.userId),
  );

  const filteredCompanyUsers = companyUsers.filter(
    (user) => !alreadyAssignedIds.has(user.id),
  );

  const updateRole = (userId, role) => {
    setSelectedMembers((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const handleAddMembers = async () => {
    const selected = Object.entries(selectedMembers)
      .filter(([_, role]) => !!role)
      .map(([userId, role]) => ({
        userId,
        projectRole: role,
      }));

    if (selected.length === 0) {
      toast("No members selected");
      return;
    }

    try {
      await addTeamMembersApi(projectId, selected);
      toast.success("Members added!");
      onClose(); // close modal
      onMemberAdded(); // refresh parent project data
      setSelectedMembers({}); // clear modal selection
    } catch (error) {
      toast.error("Failed to add members");
    }
  };

  return (
    <dialog id="addTeamModal" className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-full max-w-3xl">
        <h3 className="text-lg font-bold">Add Team Members</h3>
        <p className="text-base-content/70 mb-4 text-sm">
          Assign members and their roles
        </p>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          {filteredCompanyUsers.length > 0 ? (
            filteredCompanyUsers.map((user) => (
              <div
                key={user.id}
                className="border-base-200 bg-base-100 flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profilePic}
                    alt={user.fullName}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-base-content/60 text-sm">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <select
                    className="select select-bordered select-sm w-40 focus:outline-none"
                    value={selectedMembers[user.id] || ""}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    {roles.map((role) => (
                      <option key={role} value={role} disabled={role === "project-manager" && user.role==="member"} >
                        {rolesMap[role]}
                      </option>
                    ))}
                  </select>

                  <button
                    className={`btn btn-sm ${selectedMembers[user.id] ? "btn-error" : "btn-success"}`}
                    onClick={() => toggleSelection(user.id)}
                  >
                    {selectedMembers[user.id] ? (
                      <Minus className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    {selectedMembers[user.id] ? "Unselect" : "Select"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div>No users available</div>
          )}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Close
          </button>
          <button
            onClick={handleAddMembers}
            className="btn btn-primary"
            disabled={Object.keys(selectedMembers).length === 0}
          >
            Confirm Add
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default AddTeamMemberModal;
