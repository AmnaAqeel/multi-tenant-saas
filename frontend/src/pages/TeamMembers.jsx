import { useState, useEffect } from "react";

import { Settings2, Trash, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { useCompanyStore } from "../store/useCompanyStore";
import { useAuthStore } from "../store/useAuthStore";

import MinimalNavbar from "../components/MinimalNavbar";
import EditRolesModal from "../components/EditRolesModal";
import InviteUserModal from "../components/InviteUserModal";
import { Loader } from "../components/Loader";
import log from "../utils/logger";
import { RBAC } from "../utils/rbac";


const TeamMembers = () => {
  const {
    fetchCompanyUsers,
    companyUsers,
    updateCompanyRoles,
    deleteCompanyMember,
    isFetchingCompany,
  } = useCompanyStore();
  const { authUser } = useAuthStore();
  const role = authUser?.role;

  const [editRoles, setEditRoles] = useState(false);
  const [inviteUser, setInviteUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      fetchCompanyUsers(authUser.activeCompany);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const handleRemoveMember = async (companyId, userId) => {
    const response = await deleteCompanyMember(companyId, userId);
    if (response) fetchUsers();
  };

  log("companyUsers:", companyUsers);
  if (isFetchingCompany) return <Loader />;
  return (
    <>
      <MinimalNavbar padding="p-4" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base-content mb-1 text-lg font-medium">
              Team Members
            </h2>
            <p className="text-base-content/70 text-sm">
              Manage your team members and their roles.
            </p>
          </div>
          <div className="flex gap-3">
            <RBAC role={role} action="manage_roles">
              <button
                className={`btn btn-primary text-md btn-md font-normal ${companyUsers.length === 0 ? "cursor-not-allowed opacity-50 shadow-none" : ""}`}
                onClick={() => setEditRoles(true)}
                disabled={companyUsers.length === 0}
              >
                <Settings2 className="size-4" />
                Manage Roles
              </button>
            </RBAC>
            <RBAC role={role} action="invite_user">
              <button
                className={`btn btn-primary text-md btn-md font-normal`}
                onClick={() => setInviteUser(true)}
              >
                <UserPlus className="size-4" />
                InviteUser
              </button>
            </RBAC>
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companyUsers?.length > 0 ? (
                companyUsers.map((user) => (
                  <tr key={user.email}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img src={user.profilePic} alt={user.fullName} />
                          </div>
                        </div>
                        <div className="text-base-content font-medium">
                          {user.fullName}
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <Trash
                        className="size-4 translate-x-3 transform cursor-pointer"
                        onClick={() =>
                          handleRemoveMember(authUser.activeCompany, user.id)
                        }
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">
                    No Members yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Role Permission Note */}
        <div className="alert alert-warning mt-4 text-sm">
          <span className="font-semibold">Role Permissions:</span> Admin users
          can invite and remove members. Members have view-only access.
        </div>
        {/* Edit Roles Modal */}
        {editRoles && (
          <EditRolesModal
            members={companyUsers}
            onClose={() => setEditRoles(false)}
            onSubmit={async (updates) => {
              if (updates.length > 0) {
                await updateCompanyRoles(authUser.activeCompany, updates);
                fetchUsers();
              }
              setEditRoles(false);
            }}
          />
        )}
        {/* Invite User Modal */}
        <InviteUserModal
          isOpen={inviteUser}
          onClose={() => setInviteUser(false)}
        />
      </div>
    </>
  );
};

export default TeamMembers;
