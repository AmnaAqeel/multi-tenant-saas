import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Loader, Trash, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";

import { useProjectStore } from "../store/useProjectStore";
import { useCompanyStore } from "../store/useCompanyStore";
import MinimalNavbar from "../components/MinimalNavbar";
import AddTeamMemberModal from "../components/AddTeamMemberModal";

const EditProjectPage = () => {
  const { id } = useParams(); // Dynamic ID from URL
  const navigate = useNavigate();

  const {
    getProjectByIdApi,
    isGettingProjectById,
    updateProjectApi,
    removeTeamMembersApi,
  } = useProjectStore();
  const { fetchCompanyUsers, companyUsers } = useCompanyStore();

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [removeMembersId, setRemoveMembersId] = useState([]);
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: "",
  });

  useEffect(() => {
    refetchProject();
  }, [id]);

  const refetchProject = async () => {
    try {
      const data = await getProjectByIdApi(id);
      setProjectData(data);
      setOriginalData(data); // store the original to compare later
      fetchCompanyUsers(data.companyId);
    } catch (error) {
      toast.error("Failed to load project");
    }
  };

  console.log("CompanyUsers:", companyUsers);
  console.log("ProjectData:", projectData);

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Urgent", value: "urgent" },
  ];

  const handleUpdate = () => {
    const changedFields = {};

    if (projectData.title !== originalData.title)
      changedFields.title = projectData.title;

    if (projectData.description !== originalData.description)
      changedFields.description = projectData.description;

    if (projectData.priority !== originalData.priority)
      changedFields.priority = projectData.priority;

    if (projectData.dueDate !== originalData.dueDate)
      changedFields.dueDate = projectData.dueDate;

    if (Object.keys(changedFields).length === 0) {
      toast("No changes made!");
      return;
    }

    updateProjectApi(projectData._id, changedFields);
  };

  const handleRemoveMember = async (userId) => {
    setRemoveMembersId((prev) => {
      const updated = [...prev, userId];
      return updated;
    });
    setProjectData((prev) => {
      const updatedTeam = prev.teamMembers.filter(
        (member) => member.userId !== userId,
      );
      const updated = {
        ...prev,
        teamMembers: updatedTeam,
      };
      return updated;
    });
    console.log("removeMembersId:", removeMembersId);
    await removeTeamMembersApi(projectData._id, removeMembersId);
  };

  if (isGettingProjectById || !projectData) return <Loader />;

  console.log("projectData", projectData);

  return (
    <>
      <MinimalNavbar padding="p-8" />
      <div className="w-full space-y-8 px-4 py-6 sm:px-10">
        {/* Page Heading */}
        <div>
          <h1 className="text-base-content text-2xl font-semibold">
            Edit Project
          </h1>
          <p className="text-base-content/70">
            Make changes to your project’s settings and team.
          </p>
        </div>

        {/* Title Section */}
        <div>
          <h2 className="text-base-content mb-2 text-lg font-medium">Title</h2>
          <input
            type="text"
            className="input input-bordered w-full focus:outline-none"
            value={projectData.title}
            onChange={(e) =>
              setProjectData({ ...projectData, title: e.target.value })
            }
          />
        </div>

        {/* Description Section */}
        <div>
          <h2 className="text-base-content mb-2 text-lg font-medium">
            Description
          </h2>
          <textarea
            className="textarea textarea-bordered min-h-[120px] w-full focus:outline-none"
            value={projectData.description}
            onChange={(e) =>
              setProjectData({ ...projectData, description: e.target.value })
            }
          />
        </div>

        {/* dueDate Section */}
        <div>
          <h2 className="text-base-content mb-2 text-lg font-medium">
            DueDate
          </h2>
          <input
            type="date"
            className="input input-bordered w-full focus-within:outline-none focus:outline-none"
            value={projectData.dueDate}
            onChange={(e) =>
              setProjectData({ ...projectData, dueDate: e.target.value })
            }
          />
        </div>

        {/* Priority Section */}
        <div>
          <h2 className="text-base-content mb-2 text-lg font-medium">
            Priority
          </h2>
          <div className="flex flex-wrap gap-4">
            {priorityOptions.map((p) => (
              <label
                key={p.value}
                className={`badge cursor-pointer rounded-4xl py-4 ${
                  projectData.priority === p.value
                    ? "badge-primary text rounded-2xl py-3"
                    : "bg-base-300 text-base-content"
                }`}
                onClick={() =>
                  setProjectData({ ...projectData, priority: p.value })
                }
              >
                {p.label}
              </label>
            ))}
          </div>
        </div>

        {/* Team Members Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base-content mb-1 text-lg font-medium">
                Team Members
              </h2>
              <p className="text-base-content/70 text-sm">
                Manage your team members and their roles.
              </p>
            </div>
            <button
              className="btn btn-primary text-md btn-md font-normal"
              onClick={() => setShowAddMemberModal(true)}
            >
              <UserRoundPlus className="size-4" />
              Add Team Member
            </button>
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
                {projectData.teamMembers?.length
                  ? projectData.teamMembers.map((member) => (
                      <tr key={member.email}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-8 rounded-full">
                                <img
                                  src={member.profilePicture}
                                  alt={member.name}
                                />
                              </div>
                            </div>
                            <div className="text-base-content font-medium">
                              {member.name}
                            </div>
                          </div>
                        </td>
                        <td>{member.email}</td>
                        <td>{member.projectRole}</td>
                        <td>
                          <Trash
                            className="size-4 translate-x-3 transform cursor-pointer"
                            onClick={() => handleRemoveMember(member.userId)}
                          />
                        </td>
                      </tr>
                    ))
                  : "No Members yet"}
              </tbody>
            </table>
          </div>

          {/* Role Permission Note */}
          <div className="alert alert-warning mt-4 text-sm">
            <span className="font-semibold">Role Permissions:</span> Admin users
            can invite and remove members. Members have view-only access.
          </div>
        </div>

        {/* Update and Cancel Button */}
        <div className="space-y-4 space-x-4 place-self-end pt-4 sm:space-y-0">
          <button
            className="btn w-full font-normal sm:w-auto"
            onClick={() => {
              console.log("Navigating to /projects");
              navigate("/projects");
            }}
          >
            Close
          </button>
          <button
            className="btn btn-primary w-full font-normal sm:w-auto"
            onClick={handleUpdate}
          >
            Update
          </button>
        </div>

        <AddTeamMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          companyUsers={companyUsers}
          projectId={projectData._id}
          projectTeamMembers={projectData.teamMembers}
          onMemberAdded={refetchProject}
        />
      </div>
    </>
  );
};

export default EditProjectPage;
