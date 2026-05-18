import { type FormEvent, useEffect, useState } from "react";

type ActivityPopupMode = "start" | "stop";

export default function App() {
  const [currentView, setCurrentView] = useState("projects"); // 'projects' or 'manual'
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connectedSiteUrl, setConnectedSiteUrl] = useState("");
  const [loggedUser, setLoggedUser] = useState("");
  const [siteUrl, setSiteUrl] = useState("http://localhost:8001");
  const [apiKey, setApiKey] = useState("0f64b5169a25d81");
  const [apiSecret, setApiSecret] = useState("f1e4cce67436bf2");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [activityPopupMode, setActivityPopupMode] =
    useState<ActivityPopupMode | null>(null);
  const [activityDescription, setActivityDescription] = useState("");
  const [activityError, setActivityError] = useState("");
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const authState = await window.api.auth.get();

        if (!isMounted) {
          return;
        }

        setIsLoggedIn(authState.loggedIn);
        setConnectedSiteUrl(authState.siteUrl);
        setSiteUrl(authState.siteUrl);
      } catch (error) {
        console.error("Failed to read saved login:", error);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    async function fetchProjects() {
      try {
        setIsLoadingProjects(true);
        setProjectsError("");

        const fetchedProjects = await window.api.projects.get();

        if (!isMounted) {
          return;
        }

        setProjects(fetchedProjects);
        setSelectedProject((currentProject) =>
          currentProject || fetchedProjects[0]?.name || "",
        );
      } catch (error) {
        console.error("Failed to fetch projects:", error);

        if (isMounted) {
          setProjectsError(
            error instanceof Error ? error.message : "Could not load projects.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false);
        }
      }
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    async function fetchLoggedUser() {
      try {
        const user = await window.api.user.getLoggedUser();

        if (isMounted) {
          setLoggedUser(user);
        }
      } catch (error) {
        console.error("Failed to fetch logged user:", error);

        if (isMounted) {
          setLoggedUser("");
        }
      }
    }

    fetchLoggedUser();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsLoggingIn(true);
      setLoginError("");

      const response = await window.api.auth.login({
        siteUrl,
        apiKey,
        apiSecret,
      });

      setConnectedSiteUrl(response.siteUrl);
      setIsLoggedIn(true);
      setLoggedUser("");
      setApiKey("");
      setApiSecret("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save login.";

      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    await window.api.auth.logout();
    setIsLoggedIn(false);
    setConnectedSiteUrl("");
    setLoggedUser("");
    setProjects([]);
    setSelectedProject("");
    setProjectsError("");
    setIsTracking(false);
    setSessionId("");
    setActivityPopupMode(null);
  }

  function openActivityPopup(mode: ActivityPopupMode) {
    if (!selectedProject) {
      setProjectsError("Please select a project first.");
      return;
    }

    setActivityPopupMode(mode);
    setActivityDescription("");
    setActivityError("");
  }

  async function handleActivitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activityPopupMode) {
      return;
    }

    const description = activityDescription.trim();

    if (!description) {
      setActivityError("Activity description is required.");
      return;
    }

    try {
      setIsSavingActivity(true);
      setActivityError("");

      if (activityPopupMode === "start") {
        const trackerResponse: any = await window.api.tracker.start({
          project: selectedProject,
          description,
        });
        const nextSessionId = trackerResponse?.sessionId || "";

        await window.api.activities.create({
          project: selectedProject,
          type: "start",
          description,
          sessionId: nextSessionId,
        });

        setSessionId(nextSessionId);
        setIsTracking(true);
      } else {
        await window.api.activities.create({
          project: selectedProject,
          type: "stop",
          description,
          sessionId,
        });

        await window.api.tracker.stop();
        setIsTracking(false);
        setSessionId("");
      }

      setActivityPopupMode(null);
      setActivityDescription("");
    } catch (error) {
      setActivityError(
        error instanceof Error ? error.message : "Could not save activity.",
      );
    } finally {
      setIsSavingActivity(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex h-[700px] w-[550px] items-center justify-center font-sans border border-gray-300 rounded-lg overflow-hidden bg-[#f4f4f4] text-gray-500 shadow-2xl select-none">
        Checking login...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex h-[700px] w-[550px] items-center justify-center font-sans border border-gray-300 rounded-lg overflow-hidden bg-[#f4f4f4] text-[#555555] shadow-2xl select-none p-6">
        <form
          onSubmit={handleLogin}
          className="w-full bg-white border border-gray-200 rounded p-5 shadow-sm"
        >
          <div className="mb-5">
            <h1 className="text-xl font-normal text-gray-700">Login</h1>
            <p className="text-xs text-gray-400">
              Connect your ERPNext site with API credentials
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-gray-400 font-medium">
                Site URL
              </label>
              <input
                type="url"
                value={siteUrl}
                onChange={(event) => setSiteUrl(event.target.value)}
                placeholder="https://erp.example.com"
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 shadow-sm"
                required
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs text-gray-400 font-medium">
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 shadow-sm"
                required
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs text-gray-400 font-medium">
                API Secret
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(event) => setApiSecret(event.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 shadow-sm"
                required
              />
            </div>
          </div>

          {loginError && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded px-3 py-2 text-sm text-red-600">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-5 w-full py-3 bg-[#3ab175] hover:bg-[#319763] disabled:bg-gray-300 text-white text-base font-medium rounded shadow-sm transition-colors tracking-wide"
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative flex h-[700px] w-[550px] font-sans border border-gray-300 rounded-lg overflow-hidden bg-[#ededed] text-[#555555] shadow-2xl select-none">
      {activityPopupMode && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <form
            onSubmit={handleActivitySubmit}
            className="w-full max-w-sm bg-white border border-gray-200 rounded p-4 shadow-xl"
          >
            <h2 className="text-lg font-medium text-gray-700">
              {activityPopupMode === "start"
                ? "New Activity Description"
                : "Completed Activity Description"}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              {projects.find((project) => project.name === selectedProject)
                ?.project_name || selectedProject}
            </p>
            <input
              autoFocus
              value={activityDescription}
              onChange={(event) => setActivityDescription(event.target.value)}
              placeholder="What are you working on?"
              className="mt-4 w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 shadow-sm"
            />

            {activityError && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded px-3 py-2 text-sm text-red-600">
                {activityError}
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActivityPopupMode(null)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingActivity}
                className="px-4 py-2 bg-[#3ab175] hover:bg-[#319763] disabled:bg-gray-300 text-white text-sm font-medium rounded shadow-sm transition-colors"
              >
                {isSavingActivity ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-32 bg-white flex flex-col justify-between border-r border-gray-200 relative">
        <div>
          {/* Profile / Projects Navigation */}
          <div
            onClick={() => setCurrentView("projects")}
            className={`p-4 flex flex-col items-center text-center cursor-pointer relative group ${currentView === "projects" ? "bg-gray-50" : ""}`}
          >
            {currentView === "projects" && (
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#2da66a]" />
            )}
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-between overflow-hidden mb-1">
              <svg
                className="w-full h-full text-gray-400 pt-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700 leading-tight">
              {loggedUser || "ERPNext"}
            </span>
            <span className="text-[10px] text-gray-400 leading-tight break-all max-w-24">
              {connectedSiteUrl}
            </span>
          </div>

          {/* Manual Time Entry Navigation */}
          <div
            onClick={() => setCurrentView("manual")}
            className={`p-4 flex flex-col items-center text-center cursor-pointer relative ${currentView === "manual" ? "bg-gray-50" : ""}`}
          >
            {currentView === "manual" && (
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#2da66a]" />
            )}
            <svg
              className={`w-7 h-7 mb-1 ${currentView === "manual" ? "text-[#2da66a]" : "text-gray-500"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM9 2h6"
              />
            </svg>
            <span className="text-[11px] font-medium text-gray-500 leading-tight">
              Manual Time Entry
            </span>
          </div>
        </div>

        {/* Sidebar Footer Icons */}
        <div className="p-4 flex justify-around items-center border-t border-gray-100">
          <button className="text-gray-500 hover:text-gray-700">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.827m11.479-8.236l1.149-.827M8.14 21.27l.707-1.03m6.305-9.199l.708-1.03M12 3v1.5m0 15V21m-3.077-8.457l-.513-1.41m12.114 4.41l-.513-1.41"
              />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700"
            title="Logout"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col justify-between p-5 bg-[#f4f4f4]">
        {/* VIEW 1: PROJECTS LIST */}
        {currentView === "projects" && (
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-normal text-gray-700">Projects</h1>
                <div className="flex items-center space-x-3">
                  <span className="text-xl font-normal text-gray-600">
                    21:44
                  </span>
                  <button className="w-7 h-7 bg-[#2da66a] text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-[#258a57] transition-colors">
                    +
                  </button>
                </div>
              </div>

              {/* Filtering / Sort info */}
              <div className="text-xs text-gray-500 mb-3 flex items-center cursor-pointer">
                <span>Sort by Last Tracked (asc)</span>
                <svg
                  className="w-3 h-3 ml-1 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Projects List Container */}
              <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
                {isLoadingProjects && (
                  <div className="bg-white border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-500 shadow-sm">
                    Loading projects...
                  </div>
                )}

                {!isLoadingProjects && projectsError && (
                  <div className="bg-white border border-red-100 rounded px-3 py-2.5 text-sm text-red-500 shadow-sm">
                    {projectsError}
                  </div>
                )}

                {!isLoadingProjects && !projectsError && projects.length === 0 && (
                  <div className="bg-white border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-500 shadow-sm">
                    No projects found.
                  </div>
                )}

                {!isLoadingProjects && !projectsError && projects.map((project) => (
                  <div
                    key={project.name}
                    onClick={() => {
                      setSelectedProject(project.name);
                      setProjectsError("");
                    }}
                    className={`bg-white border rounded px-3 py-2.5 flex items-center justify-between shadow-sm transition-all cursor-pointer ${
                      selectedProject === project.name
                        ? "border-[#2da66a] ring-1 ring-[#2da66a]/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0" />
                      <span className="text-sm font-normal text-gray-600">
                        {project.project_name || project.name}
                        {project.owner === true && (
                          <span className="text-xs text-gray-400 ml-1">
                            (Owner)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* List Row Action Icons */}
                    {project.icon === "menu" && (
                      <div className="text-gray-400 font-bold tracking-tighter cursor-pointer px-1 hover:text-gray-600">
                        •••
                      </div>
                    )}
                    {project.icon === "doc" && (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Area */}
            <div className="mt-4">
              <div className="flex items-center space-x-1.5 text-xs text-gray-400 mb-3">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Tracked time synced</span>
              </div>
              <button
                onClick={() => openActivityPopup(isTracking ? "stop" : "start")}
                disabled={!selectedProject}
                className={`w-full py-3.5 text-white text-base font-semibold rounded shadow-sm transition-colors tracking-wide ${
                  isTracking
                    ? "bg-red-400 hover:bg-red-500"
                    : "bg-[#3ab175] hover:bg-[#319763]"
                } disabled:bg-gray-300`}
              >
                {isTracking ? "Stop Tracking" : "Start Tracking"}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: MANUAL TIME ENTRY FORM */}
        {currentView === "manual" && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-3.5">
              <div>
                <h1 className="text-xl font-normal text-gray-700">
                  Manual Time Entry
                </h1>
                <p className="text-xs text-gray-400">All fields are required</p>
              </div>

              {/* Project Select Dropdown */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400 font-medium">
                  Project
                </label>
                <div className="relative">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    disabled={isLoadingProjects || projects.length === 0}
                    className="w-full bg-white border-2 border-blue-400 rounded px-3 py-2 text-sm text-gray-700 outline-none appearance-none cursor-pointer shadow-sm"
                  >
                    {projects.length === 0 && (
                      <option value="">No projects available</option>
                    )}

                    {projects.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.project_name || p.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Activity Description */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400 font-medium">
                  Activity Description
                </label>
                <textarea
                  placeholder="Briefly describe what you were working on..."
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400 h-20 resize-none shadow-inner placeholder-gray-300"
                />
              </div>

              {/* Start Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400 font-medium">
                  Start Date
                </label>
                <input
                  type="text"
                  defaultValue="May 18, 2026"
                  className="w-3/5 bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400 shadow-sm"
                />
              </div>

              {/* Duration and Time Splits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-400 font-medium">
                    Duration HH:mm (Up to 24h)
                  </label>
                  <input
                    type="text"
                    defaultValue="01:00"
                    className="w-24 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none text-center shadow-sm"
                  />
                </div>
              </div>

              {/* Worked From / Worked To */}
              <div className="flex items-center space-x-3 pt-1">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-400 font-medium">
                    Worked from
                  </label>
                  <input
                    type="text"
                    defaultValue="11:52 AM"
                    className="w-28 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 outline-none text-center shadow-sm"
                  />
                </div>
                <span className="text-gray-400 self-end mb-2.5">—</span>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-400 font-medium">
                    Worked to
                  </label>
                  <input
                    type="text"
                    defaultValue="12:52 PM"
                    className="w-28 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 outline-none text-center shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Action Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full py-3 bg-[#3ab175] hover:bg-[#319763] text-white text-base font-medium rounded shadow-sm transition-colors tracking-wide">
                Add Entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
