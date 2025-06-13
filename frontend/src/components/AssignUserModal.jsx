import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Loader } from "../components/Loader";
import log from "../utils/logger";

import { useProjectStore } from "../store/useProjectStore";
import { useTaskStore } from "../store/useTaskStore";
import { X } from "lucide-react";

const AssignUserModal = ({
  projectId,
  taskId,
  assignedUsers,
  onAssignedUsersChange,
  onClose,
}) => {
  const [projectUsers, setProjectUsers] = useState([]);
  const [initialAssigned, setInitialAssigned] = useState([]);
  const { getUsersByProjectApi, isFetchingProjectUsers } = useProjectStore();
  const { updateTaskMembersApi } = useTaskStore();

  useEffect(() => {
    if (projectId) {
      const fetchUsers = async () => {
        try {
          const users = await getUsersByProjectApi(projectId);
          setProjectUsers(users || []);
          setInitialAssigned([...assignedUsers]); // snapshot for diff
        } catch (err) {
          toast.error("Failed to fetch users");
        }
      };
      fetchUsers();
    }
  }, [projectId]);


  const handleAssignChange = (selectedUserObj) => {
    const selectedUserId = selectedUserObj._id;

    const newAssignedFunction = (prev) => { // Keep this as a function for clarity
      const isAssigned = prev.some((entry) => entry.userId._id === selectedUserId);

      if (isAssigned) {
        return prev.filter((entry) => entry.userId._id !== selectedUserId);
      } else {
        return [...prev, { userId: selectedUserObj }];
      }
    };

    // Call the function with the current assignedUsers prop to get the new array
    const updatedAssignedUsers = newAssignedFunction(assignedUsers);

    log("AssignUserModal: handleAssignChange returning:", updatedAssignedUsers); // Log the actual array
    onAssignedUsersChange(updatedAssignedUsers); // Pass the resulting array
  };

  const getAssignmentDiff = (initialAssigned, currentAssigned) => {
    const initialIds = initialAssigned.map((u) => u.userId._id);
    const currentIds = currentAssigned.map((u) => u.userId._id);

    //For each user in currentAssigned, were they not already in the initialAssigned?
    // If yes → they're a new addition → include them in assignedToAdd
    const assignedToAdd = currentAssigned.filter(
      (u) => !initialIds.includes(u.userId._id),
    );
    const assignedToRemove = initialAssigned.filter(
      (u) => !currentIds.includes(u.userId._id),
    );

    return {
      assignedToAdd: assignedToAdd.map((u) => ({
        userId: u.userId._id,
      })),
      assignedToRemove: assignedToRemove.map((u) => ({
        userId: u.userId._id,
      })),
    };
  };

  const handleSubmit = async () => {
    const { assignedToAdd, assignedToRemove } = getAssignmentDiff(
      initialAssigned,
      assignedUsers,
    );

    try {
      await updateTaskMembersApi(projectId, taskId, {
        assignedToAdd,
        assignedToRemove,
      });

      toast.success("Task members updated!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task members.");
    }
  };

  if (isFetchingProjectUsers) return <Loader />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-base-100 relative w-full max-w-xl space-y-6 rounded-xl p-6 shadow-lg">
        <button
          onClick={ onClose}
          className="absolute top-4 right-4 text-lg font-bold"
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold">Assign Team Members</h2>
        <div>
          {projectUsers.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No users found for this project.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projectUsers.map((member) => (
                <label
                  key={member.user._id}
                  className="bg-base-200 flex items-center space-x-4 rounded-lg p-3 shadow-sm transition hover:shadow-md"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    value={member.user._id}
                    onChange={() => handleAssignChange(member.user)}
                    checked={assignedUsers.some(
                      (u) => u.userId._id === member.user._id,
                    )}
                  />
                  <div className="flex items-center space-x-3">
                    <img
                      src={member.user.profilePicture || "/default-avatar.png"}
                      alt={member.user.fullName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{member.user.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="text-right">
          <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignUserModal;
