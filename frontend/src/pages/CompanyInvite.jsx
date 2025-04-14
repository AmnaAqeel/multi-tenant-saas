import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCompanyStore } from "../store/useCompanyStore";
import { Loader } from "../components/Loader";
import ThemeToggle from "../components/ThemeToggle";

const CompanyInvite = () => {
  const { token } = useParams();
  const { isFetchingCompany, searchCompany, company } = useCompanyStore();
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
  if (!company) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-red-500">Invalid or expired invite link.</p>
      </div>
    );
  }

  // Render only when data is available
  return (
    <div>
      <div className="bg-base-100 min-h-screen">
        {/* Navbar */}
        <div className="navbar border-base-content/15 h-16 border-b px-4 md:w-full md:px-10 lg:px-25">
          <div className="flex h-full w-full items-center">
            <div className="flex-1">
              <h1 className="text-base-content text-xl font-medium">
                TechVision Solutions
              </h1>
            </div>
            {/* left theme toggle and notification - Hidden on mobile */}
            <div className="hidden items-center gap-4 md:flex">
              <div className="theme-toggle p-2 hover:scale-120 hover:transform md:mr-2">
                <ThemeToggle
                  className="text-base-content/70 md:text-base-content/50"
                  className2="size-7 md:size-6"
                />
              </div>
              <div className="dropdown dropdown-bottom dropdown-end hidden items-center justify-center md:flex">
                <div
                  tabIndex={0}
                  role="button"
                  className="text-base-content/55 hover:text-base-content/40 relative inline-flex items-center text-center text-sm font-medium focus:outline-none"
                >
                  {" "}
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 14 20"
                  >
                    <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
                  </svg>
                  <div className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500"></div>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-1 mt-2 w-70 p-1 shadow-sm"
                >
                  <li className="rounded-md p-2 transition hover:bg-gray-100">
                    <div className="text-sm font-medium text-gray-800">
                      New comment on your post
                    </div>
                    <div className="text-xs text-gray-500">2 mins ago</div>
                  </li>
                  <li className="rounded-md p-2 transition hover:bg-gray-100">
                    <div className="text-sm font-medium text-gray-800">
                      New follower
                    </div>
                    <div className="text-xs text-gray-500">10 mins ago</div>
                  </li>
                </ul>
              </div>
              <div className="border-base-content/15 bg-base-200 flex size-8 items-center rounded-full border">
                <img src="/vite.svg" alt="" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 border-base-content/15 border-b p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:px-20">
            {/* Left Side: Logo + Info */}
            <div className="flex flex-1 flex-col sm:flex-row sm:items-start sm:gap-6">
              {/* Logo */}
              <div className="mx-auto size-24 shrink-0 rounded-lg bg-black sm:mx-0 sm:size-28 md:size-35 lg:size-32">
                <img
                  src="/vite.svg"
                  alt="Company Logo"
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>

              {/* Text Info */}
              <div className="mt-4 flex flex-col gap-3 text-center sm:mt-0 sm:text-left">
                <h1 className="text-xl font-semibold sm:text-2xl">
                  TechVision Solutions
                </h1>
                <p className="text-base-content/60 text-sm sm:text-base max-h-15 md:overflow-hidden">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas dolore pariatur quisquam illum vero enim iure rerum reprehenderit cumque modi.
                </p>

                {/* Details */}
                <div className="text-base-content/60 mt-6 mb-4 md:mt-0 flex flex-col justify-center items-center gap-3 text-sm sm:flex-row sm:justify-center sm:gap-6 md:w-[140%] md:justify-start">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      location_on
                    </span>
                    San Francisco, CA
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      groups
                    </span>
                    500+ employees
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      language
                    </span>
                    <a href="#" className="text-primary hover:underline">
                      www.techvision.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Button: Responsive Placement */}
            <div className="flex justify-center lg:justify-end md:justify-start md:ml-42 lg:-mt-22">
              <button className="btn btn-primary px-10 text-sm transition hover:scale-105 sm:w-auto sm:text-base">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Company Overview Card*/}
        <div className="bg-base-200 space-y-10 px-4 py-12 md:space-y-10 md:px-8 lg:px-25">
          <div className="bg-base-100 space-y-10 rounded-xl p-10 shadow-sm">
            {/* Description */}
            <div>
              <h3 className="text-base-content mb-7 font-['Inter'] text-2xl font-semibold">
                Company Overview
              </h3>
              <p className="text-base-content/80 leading-relaxed">
                TechVision Solutions is a leading technology company
                specializing in enterprise software development...
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
            {/* Project 1 */}
            <div className="card bg-base-100 max-h-70 md:max-h-75 p-7 shadow-md lg:max-h-60">
              <div className="header flex justify-between">
                <h4 className="flex-1 text-base-content mb-4 md:mb-8 lg:m-0 text-lg lg:h-12">
                  AI Analytics Dashboard
                </h4>
                <div className="bg-green text-green lg:text-md flex h-7 w-auto items-center justify-center rounded-xl px-3 lg:px-2 md:px-1.5 text-sm">
                  In progress
                </div>
              </div>
              <p className="description text-base-content/60 text-sm lg:text-[16px] mb-4 md:mb-11 lg:m-0 flex items-center md:m-0 md:h-18">
                Real-time analytics platform powered by AI Real-time analytics
                platform powered by AI Real-time analytics platform powered by
                AI...
              </p>
              <div className="footer flex h-15 items-end justify-between">
                <div className="users flex -space-x-4">
                  <div className="h-full w-full overflow-hidden rounded-full bg-black">
                    <img
                      className="size-10 object-cover"
                      src="/vite.svg"
                      alt="user1"
                    />
                  </div>
                  <div className="h-full w-full overflow-hidden rounded-full bg-black">
                    <img
                      className="size-10 object-cover"
                      src="/vite.svg"
                      alt="user1"
                    />
                  </div>
                  <div className="h-full w-full overflow-hidden rounded-full bg-black">
                    <img
                      className="size-10 object-cover"
                      src="/vite.svg"
                      alt="user1"
                    />
                  </div>
                </div>
                <button className="btn btn-primary flex w-35 items-center justify-center rounded-lg">
                  View Project
                </button>
              </div>
            </div>

            {/* Project 2 */}
            <div className="card bg-base-100 max-h-70 md:max-h-75 p-7 shadow-md lg:max-h-60">
              <div className="header flex justify-between">
                <h4 className="flex-1 text-base-content mb-4 md:mb-8 lg:m-0 text-lg lg:h-12">
                  AI Analytics Dashboard
                </h4>
                <div className="bg-green text-green lg:text-md flex h-7 w-auto items-center justify-center rounded-xl lg:px-2 md:px-1.5 text-sm">
                  In progress
                </div>
              </div>
              <p className="description text-base-content/60 mb-4 md:mb-11 lg:m-0 flex items-center md:m-0 md:h-18">
                Real-time analytics platform powered by AI Real-time analytics
                platform powered by AI Real-time analytics platform powered by
                AI...
              </p>
              <div className="footer flex h-15 items-end justify-between">
                <div className="users flex -space-x-4">
                  <div className="h-full w-full overflow-hidden rounded-full bg-black">
                    <img
                      className="size-10 object-cover"
                      src="/vite.svg"
                      alt="user1"
                    />
                  </div>
                  <div className="h-full w-full overflow-hidden rounded-full bg-black">
                    <img
                      className="size-10 object-cover"
                      src="/vite.svg"
                      alt="user1"
                    />
                  </div>
                  <div className="h-full w-full overflow-hidden rounded-full bg-black">
                    <img
                      className="size-10 object-cover"
                      src="/vite.svg"
                      alt="user1"
                    />
                  </div>
                </div>
                <button className="btn btn-primary flex w-35 items-center justify-center rounded-lg">
                  View Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInvite;
