import { useEffect, useState } from "react";
import { format } from "date-fns/format";
import { RotateCw, Search, Trash } from "lucide-react";

import MinimalNavbar from "../components/MinimalNavbar";
import { Loader } from "../components/Loader";

import { useProjectStore } from "../store/useProjectStore";
import { useAuthStore } from "../store/useAuthStore";

import { RBAC } from "../utils/rbac";
import log from "../utils/logger";

const Archive = () => {
  const {
    archiveProjectApi,
    deleteProjectApi,
    restoreProjectApi,
    isFetchingArchive,
  } = useProjectStore();
  const [archiveProjects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { authUser } = useAuthStore();
  const role = authUser?.role;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await archiveProjectApi();
        setProjects(projects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleRemoveProject = async (id) => {
    try {
      const response = await deleteProjectApi(id);
      if (response) {
        setProjects((prevProjects) =>
          prevProjects.filter((project) => project._id !== id),
        );
      }
    } catch (error) {
      console.error("Failed to remove project:", error);
    }
  };

  const handleRestoreProject = async (id) => {
    try {
      const response = await restoreProjectApi(id);
      if (response) {
        setProjects((prevProjects) =>
          prevProjects.filter((project) => project._id !== id),
        );
      }
    } catch (error) {
      console.error("Failed to restore project:", error);
    }
  };

  const projectsArchivedLast30Days = archiveProjects?.filter((project) => {
    if (!project) return false;
    if (!project.lastUpdated) return false;

    const archivedDate = new Date(project.lastUpdated);
    const now = new Date();

    const diffInTime = now.getTime() - archivedDate.getTime(); // in milliseconds
    const diffInDays = diffInTime / (1000 * 3600 * 24); // convert to days

    return diffInDays <= 30;
  });

  log("All Projects in Archine.jsx:", archiveProjects);

  const filteredProjects = archiveProjects?.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isFetchingArchive) return <Loader />;

  return (
    <>
      <MinimalNavbar padding="p-4" />
      <div className="bg-base-200 min-h-screen px-8">
        <div className="flex items-center justify-between py-5">
          <h2 className="text-base-content text-lg font-semibold">
            Project Archive
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search archives..."
              className="input border-base-300 input-sm w-full max-w-xs border pl-6 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="text-base-content/40 absolute top-2 left-2 size-3.5"
              strokeWidth={3}
            />
          </div>
        </div>

        {/* Stats Boxes */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-base-100 rounded-box p-4 text-center shadow">
            <div className="text-base-content/70 text-sm">Total Archived</div>
            <div className="text-2xl font-bold">{archiveProjects?.length}</div>
          </div>
          <div className="bg-base-100 rounded-box p-4 text-center shadow">
            <div className="text-base-content/70 text-sm">
              Archived This Month
            </div>
            <div className="text-2xl font-bold">
              {projectsArchivedLast30Days?.length}
            </div>
          </div>
          <div className="bg-base-100 rounded-box p-4 text-center shadow">
            <div className="text-base-content/70 text-sm">
              Total Team Members
            </div>
            <div className="text-2xl font-bold">
              {filteredProjects
                ?.map((project) =>
                  project.teamMembers.length === 0
                    ? 0
                    : project.teamMembers.length,
                )
                .reduce((a, b) => a + b, 0)}
            </div>
          </div>
        </div>

        {/* Project Table */}
        <div className="overflow-x-auto shadow-xs">
          <table className="bg-base-100 rounded-box table">
            <thead className="shadow-xs">
              <tr className="text-base-content/70 bg-base-200 text-sm">
                <th>Project Name</th>
                <th>Archived Date</th>
                <th>Team Members</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects?.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr key={project._id} className="shadow-xs">
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium">{project.title}</span>
                        <span className="text-base-content/60 text-sm">
                          Archived by {project.archivedBy.fullName}
                        </span>
                      </div>
                    </td>
                    <td>
                      {project.lastUpdated
                        ? format(new Date(project.lastUpdated), "dd-MM-yyyy")
                        : ""}
                    </td>
                    <td>
                      {project.teamMembers.length ? (
                        project.teamMembers.map((member) => {
                          return (
                            <div key={member._id}>
                              <div className="flex translate-x-5 transform -space-x-2">
                                <div className="size-6 rounded-full ring ring-white">
                                  <img
                                    src={member.user.profilePicture}
                                    className="size-6 rounded-full"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="italic">No TeamMembers</p>
                      )}
                    </td>
                    <td className="flex -translate-x-5 transform">
                      <RBAC role={role} action="delete_project">
                        <button
                          className="btn btn-ghost text-primary btn-sm flex -space-x-1"
                          onClick={() => handleRestoreProject(project._id)}
                        >
                          <RotateCw
                            strokeWidth={3}
                            className="text-primary size-3.5"
                          />
                          <span>Restore</span>
                        </button>
                      </RBAC>
                      <RBAC role={role} action="restore_project">
                        <button
                          className="btn btn-ghost btn-sm flex -space-x-1 text-red-600"
                          onClick={() => handleRemoveProject(project._id)}
                        >
                          <Trash
                            strokeWidth={3}
                            className="size-3.5 text-red-500"
                          />
                          <span>Delete</span>
                        </button>
                      </RBAC>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-base-content/70 py-6 text-center italic"
                  >
                    No archived projects
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Archive;
