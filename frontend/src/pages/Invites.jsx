import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trash } from "lucide-react";

import { useInviteStore } from "../store/useInviteStore";
import MinimalNavbar from "../components/MinimalNavbar";
import { Loader } from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";

const Invites = () => {
  const [invites, setInvites] = useState([]);
  const [toDelete, setToDelete] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { fetchInvites, deleteInvite, isFetchingInvites } = useInviteStore();

  const loadInvites = async () => {
    const res = await fetchInvites();
    setInvites(res);
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleDelete = async () => {
    const res = await deleteInvite(toDelete);
    if (res) {
      loadInvites();
      setIsOpen(false);
    }
  };
  if (isFetchingInvites) return <Loader />;

  return (
    <>
      <MinimalNavbar padding="p-5" />
      <div className="px-7.5 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base-content mb-1 text-lg font-medium">
              Invitations
            </h2>
            <p className="text-base-content/70 text-sm">
              Manage pending invites to your company.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Invited By</th>
                <th>Invited User</th>
                <th>Role Assigned</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invites.length > 0 ? (
                invites.map((invite) => (
                  <tr key={invite._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={invite.invitedBy.profilePicture}
                              alt={invite.invitedBy.fullName}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {invite.invitedBy.fullName}
                          </div>
                          <div className="text-xs opacity-50">
                            {invite.invitedBy.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium">{invite.email}</td>

                    <td>
                      <span className="badge badge-primary capitalize">
                        {invite.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge -translate-x-3 transform ${
                          invite.status === "pending"
                            ? "badge-warning"
                            : invite.status === "accepted"
                              ? "badge-success"
                              : "badge-error"
                        } capitalize`}
                      >
                        {invite.status}
                      </span>
                    </td>
                    <td className="text-base-content/70 text-sm">
                      {invite.createdAt
                        ? format(new Date(invite.createdAt), "dd-MM-yyyy")
                        : ""}
                    </td>
                    <td>
                      <Trash
                        className="size-4 translate-x-3 transform cursor-pointer"
                        onClick={() => {
                          setIsOpen(true);
                          setToDelete(invite._id);
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    No invites yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal
        isOpen={isOpen}
        onClose={()=> setIsOpen(false)}
        onConfirm={handleDelete}
        title="Remove Invitation?"
        description="Are you sure you want to remove this invitation?"
        confirmText="Remove"
      />
    </>
  );
};
export default Invites;
