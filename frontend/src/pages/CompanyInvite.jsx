import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { refreshAuthUser } from "../utils/refreshAuthUser";
import MinimalNavbar from "../components/MinimalNavbar";
import StatusBadge from "../components/StatusBadge";
import { Loader } from "../components/Loader";
import { ButtonLoader } from "../components/Loader";

import { useAuthStore } from "../store/useAuthStore";
import { useCompanyStore } from "../store/useCompanyStore";
import { useInviteStore } from "../store/useInviteStore";
import PriorityBadge from "../components/PriorityBadge";

import log from "../utils/logger";

const CompanyInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { isFetchingCompany, searchCompany, inviteCompany } = useCompanyStore();
  const { authUser } = useAuthStore();
  const { isJoining, joinCompany } = useInviteStore();

  const [dataFetched, setDataFetched] = useState(false); // Tracks when API call is done

  useEffect(() => {
    // Fetch company details
    if (token) {
      searchCompany(token).then(() => setDataFetched(true)); // Wait for API response
    }
  }, [token, searchCompany]);

  //  Show a loader until dataFetched is true
  if (!dataFetched || isFetchingCompany) {
    return <Loader />;
  }

  //  If no company is found, show an error instead of breaking the page
  if (!inviteCompany) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-red-500">Invalid or expired invite link.</p>
      </div>
    );
  }

  const handleJoin = async () => {
    log("entered handle Join...");
    if (!authUser) {
      localStorage.setItem("inviteToken", token);
      localStorage.setItem("postLoginRedirect", `/company-invite/${token}`);
      log("navigating to login...");
      navigate("/signin");
      return;
    }

    try {
      log("user is authenticated...");
      const res = await joinCompany(token); 
      log("res of join company:", res);
      if (res) {
        const refreshedUser = await refreshAuthUser();
        log("refreshedUser: ", refreshedUser);
        if (refreshedUser) {
          log("navigating to dashboard...");
          navigate("/");
        }
      }
    }  catch (err) {
      toast.error(err.response?.data?.message || "Failed to join company.");
    }
  };

  log("fetched Data:", dataFetched);
  log("inviteCompany:", inviteCompany);

  // Render only when data is available
  return (
    <div>
      <div className="bg-base-100 min-h-screen">
        <MinimalNavbar name={inviteCompany.name} />

        <div className="bg-base-100 border-base-content/15 border-b p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            {/* Left Side: Logo + Info */}
            <div className="flex flex-1 flex-col sm:flex-row sm:items-start sm:gap-6">
              {/* Logo */}
              <div className="mx-auto size-24 shrink-0 rounded-lg sm:mx-0 sm:size-28 md:size-35 lg:size-32">
                <img
                  src={inviteCompany.logo || "/postman.png"}
                  alt="Company Logo"
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>

              {/* Text Info */}
              <div className="mt-4 flex flex-col gap-3 text-center sm:mt-0 sm:text-left">
                <h1 className="text-xl font-semibold sm:text-2xl">
                  {inviteCompany.name}
                </h1>
                <p className="text-base-content/60 max-h-15 text-sm sm:text-base md:overflow-hidden">
                  {inviteCompany.description}
                </p>

                {/* Details */}
                <div className="text-base-content/60 mt-6 mb-4 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:justify-center sm:gap-6 md:mt-0 md:w-[140%] md:justify-start">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      location_on
                    </span>
                    {inviteCompany.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      groups
                    </span>
                    {inviteCompany.employees}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      language
                    </span>
                    <a href="#" className="text-primary hover:underline">
                      {inviteCompany.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Button: Responsive Placement */}
            <div className="flex justify-center md:ml-42 md:justify-start lg:-mt-22 lg:justify-end">
              <button
                className="btn btn-primary px-10 text-sm transition hover:scale-105 sm:w-auto sm:text-base"
                onClick={handleJoin}
                disabled={isJoining}
              >
                {isJoining ? <ButtonLoader /> : "Join"}
              </button>
            </div>
          </div>
        </div>

        {/* Company Overview Card*/}
        <div className="bg-base-200 space-y-10 px-4 py-12 md:space-y-10 md:px-8 lg:px-15">
          <div className="bg-base-100 space-y-10 rounded-xl p-10 shadow-sm">
            {/* Description */}
            <div>
              <h3 className="text-base-content mb-7 font-['Inter'] text-2xl font-semibold">
                Company Overview
              </h3>
              <p className="text-base-content/80 leading-relaxed">
                {inviteCompany.description}
              </p>
            </div>

            {/* Innovation Highlights */}
            <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-3 md:px-0">
              <div className="card border-base-content/15 flex items-center justify-center border p-6">
                <h4 className="text-primary mb-2 text-3xl font-bold">150+</h4>
                <p className="text-base-content/60 font-light">
                  Projects Completed
                </p>
              </div>
              <div className="card border-base-content/15 flex items-center justify-center border p-6">
                <h4 className="text-primary mb-2 text-3xl font-bold">98%</h4>
                <p className="text-base-content/60 font-light">
                  Client Satisfaction
                </p>
              </div>
              <div className="card border-base-content/15 flex items-center justify-center border p-6">
                <h4 className="text-primary mb-2 text-3xl font-bold">12+</h4>
                <p className="text-base-content/60 font-light">
                  Years Experience
                </p>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <h3 className="text-base-content mb-8 font-['Inter'] text-2xl font-semibold">
            Recent Projects
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {inviteCompany.projects.length ? (
              inviteCompany.projects.map((project) => (
                <div
                  className="card bg-base-100 max-h-70 p-7 shadow-md md:max-h-75 lg:max-h-60"
                  key={project._id}
                  data={project}
                >
                  {" "}
                  {/* Added key prop */}
                  <div className="header flex justify-between">
                    <h4 className="text-base-content flex-1 text-lg md:mb-8 lg:m-0 lg:h-12">
                      {project.title}
                    </h4>
                    <div className="lg:text-md md:-pt-2.5 flex items-center justify-center md:px-1.5 lg:px-2">
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="lg:text-md md:-pt-2.5 flex items-center justify-center md:px-1.5 lg:px-2">
                      <PriorityBadge priority={project.priority} />
                    </div>
                  </div>
                  <p className="description text-base-content/60 mb-4 flex items-center text-sm md:m-0 md:mb-11 md:h-18 lg:m-0 lg:text-[16px]">
                    {project.description}
                  </p>
                  <div className="footer flex items-end justify-between">
                    <div className="users flex -space-x-4">
                      {
                        project.teamMembers.length
                          ? project.teamMembers.map((member) => (
                              // {/* Removed the extra curly braces here */}
                              <div
                                className="h-full w-full overflow-hidden rounded-full"
                                key={member._id || member.fullName}
                              >
                                {" "}
                                {/* Added key prop */}
                                <img
                                  className="size-10 object-cover"
                                  src={member.user.profilePicture}
                                  alt={member.user.fullName || "user"}
                                />
                              </div>
                            ))
                          : "" /* Or you can render something else if there are no team members */
                      }
                    </div>
                    {/* <button className="btn btn-primary flex w-35 items-center justify-center rounded-lg">
                      View Project
                    </button> */}
                  </div>
                </div>
              ))
            ) : (
              <p className="px-4">No projects to see yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInvite;
