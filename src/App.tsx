import { type FormEvent, useEffect, useRef, useState } from "react";
import ConfigurationWindow from "./ConfigurationWindow";

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function formatMediaFileUrl(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, "/");

  return `file://${normalizedPath.split("/").map(encodeURIComponent).join("/")}`;
}

function getMediaStatusClass(status: ActivityMediaUploadStatus) {
  if (status === "uploaded") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-600";
  }

  if (status === "uploading") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function App() {
  if (new URLSearchParams(window.location.search).get("window") === "config") {
    return <ConfigurationWindow />;
  }

  const [currentView, setCurrentView] = useState<
    "projects" | "manual" | "activities" | "media"
  >("projects");
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
  const [recentActivities, setRecentActivities] = useState<ActivityRecord[]>([]);
  const [recentSessions, setRecentSessions] = useState<
    ActivitySessionSummaryRecord[]
  >([]);
  const [activityMedia, setActivityMedia] = useState<ActivityMediaRecord[]>([]);
  const [mediaFilter, setMediaFilter] =
    useState<ActivityMediaFilter>("screenshot");
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [activitiesError, setActivitiesError] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [popupFrequencyMinutes, setPopupFrequencyMinutes] = useState(30);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const isActivityPromptOpenRef = useRef(false);

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

    async function hydrateTrackerStatus() {
      try {
        const trackerStatus = await window.api.tracker.status();

        if (!isMounted) {
          return;
        }

        setIsTracking(trackerStatus.isTracking);
        setSessionId(trackerStatus.sessionId);
        setStartedAt(trackerStatus.startedAt);

        if (trackerStatus.project) {
          setSelectedProject(trackerStatus.project);
        }
      } catch (error) {
        console.error("Failed to hydrate tracker status:", error);
      }
    }

    hydrateTrackerStatus();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || currentView !== "activities") {
      return;
    }

    refreshRecentActivities();
  }, [currentView, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || currentView !== "media") {
      return;
    }

    refreshActivityMedia();
  }, [currentView, isLoggedIn, mediaFilter]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    async function fetchSettings() {
      try {
        const loadedConfig = await window.api.config.get();
        const settings = await window.api.settings.get();

        if (isMounted) {
          setConfig(loadedConfig);
          setPopupFrequencyMinutes(settings.popup_frequency_minutes);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    return window.api.config.onUpdated((updatedConfig) => {
      setConfig(updatedConfig);
      setPopupFrequencyMinutes(
        updatedConfig.general.activityUpdateIntervalMinutes || 0,
      );
    });
  }, []);

  useEffect(() => {
    if (!isTracking || popupFrequencyMinutes <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      promptForActivity("start").then((description) => {
        if (!description) {
          return;
        }

        window.api.tracker
          .updateActivity({ description })
          .then(() => refreshRecentActivities())
          .catch((error) => {
            setProjectsError(
              error instanceof Error
                ? error.message
                : "Could not update activity.",
            );
          });
      });
    }, popupFrequencyMinutes * 60 * 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isTracking, popupFrequencyMinutes, selectedProject, sessionId]);

  useEffect(() => {
    if (!isTracking || !startedAt) {
      setElapsedSeconds(0);
      return;
    }

    function updateElapsedSeconds() {
      setElapsedSeconds(
        Math.max(
          0,
          Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
        ),
      );
    }

    updateElapsedSeconds();

    const interval = window.setInterval(updateElapsedSeconds, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isTracking, startedAt]);

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
    setRecentActivities([]);
    setRecentSessions([]);
    setActivityMedia([]);
    setSelectedProject("");
    setProjectsError("");
    setIsTracking(false);
    setSessionId("");
    setStartedAt("");
    setElapsedSeconds(0);
  }

  async function refreshRecentActivities() {
    try {
      setIsLoadingActivities(true);
      setActivitiesError("");
      const [sessions, activities] = await Promise.all([
        window.api.activities.listRecentSessions(50),
        window.api.activities.listRecentUnsynced(50),
      ]);

      setRecentSessions(sessions);
      setRecentActivities(activities);
    } catch (error) {
      setActivitiesError(
        error instanceof Error ? error.message : "Could not load activities.",
      );
    } finally {
      setIsLoadingActivities(false);
    }
  }

  async function refreshActivityMedia() {
    try {
      setIsLoadingMedia(true);
      setMediaError("");
      setActivityMedia(await window.api.activities.listMedia(mediaFilter, 100));
    } catch (error) {
      setMediaError(
        error instanceof Error ? error.message : "Could not load screenshots.",
      );
    } finally {
      setIsLoadingMedia(false);
    }
  }

  function getSelectedProjectLabel() {
    return (
      projects.find((project) => project.name === selectedProject)
        ?.project_name || selectedProject
    );
  }

  async function promptForActivity(type: "start" | "stop") {
    if (!selectedProject) {
      setProjectsError("Please select a project first.");
      return null;
    }

    const shouldAsk =
      type === "start"
        ? config?.advanced.askActivityDescriptionOnTrackingStart !== false
        : config?.advanced.askActivityDescriptionOnTrackingStop !== false;

    if (!shouldAsk) {
      return type === "start" ? "Started tracking" : "Completed tracking";
    }

    if (isActivityPromptOpenRef.current) {
      return null;
    }

    try {
      isActivityPromptOpenRef.current = true;

      return await window.api.activities.promptDescription({
        project: selectedProject,
        projectLabel: getSelectedProjectLabel(),
        type,
        sessionId,
        title:
          type === "start"
            ? "New Activity Description"
            : "Completed Activity Description",
      });
    } finally {
      isActivityPromptOpenRef.current = false;
    }
  }

  async function handleTrackingClick() {
    if (!selectedProject) {
      setProjectsError("Please select a project first.");
      return;
    }

    try {
      if (!isTracking) {
        const description = await promptForActivity("start");

        if (!description) {
          return;
        }

        const trackerResponse = await window.api.tracker.start({
          project: selectedProject,
          description,
        });

        setSessionId(trackerResponse.sessionId);
        setStartedAt(trackerResponse.startedAt);
        setIsTracking(true);
        setCurrentView("activities");
        refreshRecentActivities();
      } else {
        const description = await promptForActivity("stop");

        if (!description) {
          return;
        }

        await window.api.tracker.updateActivity({ description });
        await window.api.tracker.stop();
        setIsTracking(false);
        setSessionId("");
        setStartedAt("");
        setElapsedSeconds(0);
        setCurrentView("activities");
        refreshRecentActivities();
      }
    } catch (error) {
      setProjectsError(
        error instanceof Error ? error.message : "Could not update tracking.",
      );
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex h-[700px] w-[550px] items-center justify-center overflow-hidden border border-stone-200 bg-[#f8f4ea] font-sans text-stone-500 shadow-2xl select-none">
        Checking login...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex h-[700px] w-[550px] items-center justify-center overflow-hidden border border-stone-200 bg-[#f8f4ea] p-6 font-sans text-stone-700 shadow-2xl select-none">
        <form
          onSubmit={handleLogin}
          className="w-full rounded-[24px] border border-stone-200 bg-white/90 p-6 shadow-[0_18px_60px_rgba(68,64,60,0.18)]"
        >
          <div className="mb-5">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#243c35] text-lg font-semibold text-[#f6d97a]">
              ET
            </div>
            <h1 className="text-2xl font-semibold text-stone-900">
              Connect workspace
            </h1>
            <p className="text-xs text-stone-500">
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
                className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf6] px-4 py-3 text-sm text-stone-800 outline-none focus:border-[#2f6f5f] focus:bg-white"
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
                className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf6] px-4 py-3 text-sm text-stone-800 outline-none focus:border-[#2f6f5f] focus:bg-white"
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
                className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf6] px-4 py-3 text-sm text-stone-800 outline-none focus:border-[#2f6f5f] focus:bg-white"
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
            className="mt-5 w-full rounded-2xl bg-[#243c35] py-3 text-base font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-[#31564d] disabled:bg-stone-300"
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative flex h-[700px] w-[550px] flex-col overflow-hidden rounded-[30px] border border-stone-200 bg-[#f8f4ea] font-sans text-stone-800 shadow-2xl select-none">
      <div className="border-b border-stone-200 bg-[#263d35] px-5 pb-4 pt-5 text-white">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f6d97a]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f6d97a]">
                ERPNext Time
              </span>
            </div>
            <h1 className="truncate text-xl font-semibold">
              {loggedUser || "Workspace"}
            </h1>
            <p className="truncate text-xs text-white/60">{connectedSiteUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.api.config.openWindow()}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/15"
              title="Configuration"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.607 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/15"
              title="Logout"
            >
              <svg
                className="h-4 w-4"
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

        <div className="grid grid-cols-4 gap-2 rounded-[20px] bg-black/15 p-1">
          {[
            ["projects", "Track"],
            ["manual", "Manual"],
            ["activities", "Queue"],
            ["media", "Media"],
          ].map(([view, label]) => (
            <button
              key={view}
              onClick={() => setCurrentView(view as typeof currentView)}
              className={`rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                currentView === view
                  ? "bg-[#f8f4ea] text-[#243c35] shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-5">
        {/* VIEW 1: PROJECTS LIST */}
        {currentView === "projects" && (
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-4 rounded-[26px] bg-white p-4 shadow-[0_14px_45px_rgba(68,64,60,0.12)]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Current session
                    </p>
                    <h2 className="truncate text-lg font-semibold text-stone-900">
                      {getSelectedProjectLabel() || "Choose a project"}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      isTracking
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {isTracking ? "Live" : "Ready"}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="block font-mono text-4xl font-semibold tracking-normal text-[#243c35]">
                    {formatDuration(elapsedSeconds)}
                    </span>
                    <span className="text-xs text-stone-400">
                      tracked in this run
                    </span>
                  </div>
                  <button
                    onClick={handleTrackingClick}
                    disabled={!selectedProject}
                    className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition ${
                      isTracking
                        ? "bg-[#b84c43] hover:bg-[#a1433b]"
                        : "bg-[#243c35] hover:bg-[#31564d]"
                    } disabled:bg-stone-300`}
                  >
                    {isTracking ? "Stop" : "Start"}
                  </button>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-stone-700">
                  Project board
                </h2>
                <span className="text-[11px] text-stone-400">
                  {projects.length} items
                </span>
              </div>

              <div className="max-h-[315px] space-y-2 overflow-y-auto pr-1">
                {isLoadingProjects && (
                  <div className="rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm text-stone-500">
                    Loading projects...
                  </div>
                )}

                {!isLoadingProjects && projectsError && (
                  <div className="rounded-2xl border border-red-100 bg-white px-3 py-3 text-sm text-red-500">
                    {projectsError}
                  </div>
                )}

                {!isLoadingProjects && !projectsError && projects.length === 0 && (
                  <div className="rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm text-stone-500">
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
                    className={`flex cursor-pointer items-center justify-between rounded-[20px] border px-3 py-3 transition-all ${
                      selectedProject === project.name
                        ? "border-[#d5b95f] bg-[#fff8dc] shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`h-9 w-2 flex-shrink-0 rounded-full ${
                          selectedProject === project.name
                            ? "bg-[#d5b95f]"
                            : "bg-stone-200"
                        }`}
                      />
                      <span className="truncate text-sm font-medium text-stone-700">
                        {project.project_name || project.name}
                        {project.owner === true && (
                          <span className="ml-1 text-xs text-stone-400">
                            (Owner)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* List Row Action Icons */}
                    {project.icon === "menu" && (
                      <div className="cursor-pointer px-1 font-bold tracking-tighter text-stone-300 hover:text-stone-500">
                        •••
                      </div>
                    )}
                    {project.icon === "doc" && (
                      <svg
                        className="h-4 w-4 text-stone-300"
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

            <div className="mt-4 rounded-[22px] border border-stone-200 bg-white/70 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Sync state</span>
                <span className="font-semibold text-[#2f6f5f]">Local queue ready</span>
              </div>
            </div>
          </div>
        )}

        {currentView === "activities" && (
          <div className="flex h-full flex-col rounded-[26px] bg-white p-4 shadow-[0_14px_45px_rgba(68,64,60,0.10)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-stone-900">
                  Activity Queue
                </h1>
                <p className="text-xs text-stone-400">
                  Unsynced local activity queue
                </p>
              </div>
              <button
                onClick={refreshRecentActivities}
                className="rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-2 text-sm font-medium text-stone-600 hover:border-stone-300"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto pr-1">
              {isLoadingActivities && (
                <div className="rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-3 text-sm text-stone-500">
                  Loading activities...
                </div>
              )}

              {!isLoadingActivities && activitiesError && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-500">
                  {activitiesError}
                </div>
              )}

              {!isLoadingActivities &&
                !activitiesError &&
                recentSessions.length === 0 &&
                recentActivities.length === 0 && (
                  <div className="rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-3 text-sm text-stone-500">
                    No unsynced activities.
                  </div>
                )}

              {!isLoadingActivities &&
                !activitiesError &&
                recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-[20px] border border-stone-200 bg-[#fbfaf6] px-3 py-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-stone-800">
                        {session.projectId}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize ${
                          session.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : session.status === "idle"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600">
                      {session.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-400">
                      <span>{new Date(session.startTime).toLocaleString()}</span>
                      {session.endTime && (
                        <span>Ended {new Date(session.endTime).toLocaleString()}</span>
                      )}
                      <span>Duration: {formatDuration(session.duration)}</span>
                      <span>Screenshots: {session.screenshotCount}</span>
                      <span>Camshots: {session.camshotCount}</span>
                      <span>Keys: {session.keyboardCount}</span>
                      <span>Clicks: {session.mouseClickCount}</span>
                    </div>
                  </div>
                ))}

              {!isLoadingActivities &&
                !activitiesError &&
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-[20px] border border-stone-200 bg-[#fbfaf6] px-3 py-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-stone-800">
                        {activity.project}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                          activity.type === "start"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {activity.type === "start" ? "Started" : "Stopped"}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600">
                      {activity.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-400">
                      <span>{new Date(activity.createdAt).toLocaleString()}</span>
                      <span>Status: {activity.syncStatus}</span>
                      {activity.screenshotPaths.length > 0 && (
                        <span>
                          Screenshots: {activity.screenshotPaths.length}
                        </span>
                      )}
                      {activity.camshotPaths.length > 0 && (
                        <span>Camshots: {activity.camshotPaths.length}</span>
                      )}
                    </div>
                    {activity.uploadError && (
                      <div className="mt-2 rounded bg-red-50 px-2 py-1 text-[11px] text-red-600">
                        {activity.uploadError}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {currentView === "media" && (
          <div className="flex h-full flex-col rounded-[26px] bg-white p-4 shadow-[0_14px_45px_rgba(68,64,60,0.10)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-stone-900">
                  Capture Gallery
                </h1>
                <p className="text-xs text-stone-400">
                  Local captures and upload status
                </p>
              </div>
              <button
                onClick={refreshActivityMedia}
                className="rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-2 text-sm font-medium text-stone-600 hover:border-stone-300"
              >
                Refresh
              </button>
            </div>

            <div className="mb-3 flex rounded-2xl border border-stone-200 bg-[#fbfaf6] p-1">
              {(["screenshot", "camshot", "all"] as ActivityMediaFilter[]).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setMediaFilter(filter)}
                    className={`flex-1 rounded-xl px-2 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      mediaFilter === filter
                        ? "bg-[#243c35] text-white"
                        : "text-stone-500 hover:bg-white"
                    }`}
                  >
                    {filter === "all" ? "All" : `${filter}s`}
                  </button>
                ),
              )}
            </div>

            <div className="space-y-2 overflow-y-auto pr-1">
              {isLoadingMedia && (
                <div className="rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-3 text-sm text-stone-500">
                  Loading screenshots...
                </div>
              )}

              {!isLoadingMedia && mediaError && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-500">
                  {mediaError}
                </div>
              )}

              {!isLoadingMedia && !mediaError && activityMedia.length === 0 && (
                <div className="rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-3 text-sm text-stone-500">
                  No captured media found.
                </div>
              )}

              {!isLoadingMedia &&
                !mediaError &&
                activityMedia.map((media) => (
                  <div
                    key={media.id}
                    className="overflow-hidden rounded-[22px] border border-stone-200 bg-[#fbfaf6]"
                  >
                    <div className="h-36 bg-stone-100">
                      <img
                        src={
                          media.previewDataUrl ||
                          formatMediaFileUrl(media.filePath)
                        }
                        alt={`${media.mediaType} preview`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-stone-800">
                          {media.project || "Unknown project"}
                        </span>
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-medium capitalize ${getMediaStatusClass(
                            media.uploadStatus,
                          )}`}
                        >
                          {media.uploadStatus}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-stone-600">
                        {media.description || "No activity description"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-400">
                        <span className="capitalize">{media.mediaType}</span>
                        <span>{new Date(media.createdAt).toLocaleString()}</span>
                        {media.uploadedAt && (
                          <span>
                            Uploaded {new Date(media.uploadedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-stone-400">
                        {media.filePath}
                      </div>
                      {media.uploadError && (
                        <div className="rounded bg-red-50 px-2 py-1 text-[11px] text-red-600">
                          {media.uploadError}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 2: MANUAL TIME ENTRY FORM */}
        {currentView === "manual" && (
          <div className="flex h-full flex-col justify-between rounded-[26px] bg-white p-4 shadow-[0_14px_45px_rgba(68,64,60,0.10)]">
            <div className="space-y-3.5">
              <div>
                <h1 className="text-xl font-semibold text-stone-900">
                  Manual Time Entry
                </h1>
                <p className="text-xs text-stone-400">All fields are required</p>
              </div>

              {/* Project Select Dropdown */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-stone-400">
                  Project
                </label>
                <div className="relative">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    disabled={isLoadingProjects || projects.length === 0}
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-3 text-sm text-stone-800 outline-none focus:border-[#2f6f5f]"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
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
                <label className="text-xs font-medium text-stone-400">
                  Activity Description
                </label>
                <textarea
                  placeholder="Briefly describe what you were working on..."
                  className="h-20 w-full resize-none rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-3 text-sm text-stone-800 outline-none placeholder-stone-300 focus:border-[#2f6f5f]"
                />
              </div>

              {/* Start Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-stone-400">
                  Start Date
                </label>
                <input
                  type="text"
                  defaultValue="May 18, 2026"
                  className="w-3/5 rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-3 text-sm text-stone-800 outline-none focus:border-[#2f6f5f]"
                />
              </div>

              {/* Duration and Time Splits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-stone-400">
                    Duration HH:mm (Up to 24h)
                  </label>
                  <input
                    type="text"
                    defaultValue="01:00"
                    className="w-24 rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-2 text-center text-sm font-semibold text-stone-800 outline-none focus:border-[#2f6f5f]"
                  />
                </div>
              </div>

              {/* Worked From / Worked To */}
              <div className="flex items-center space-x-3 pt-1">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-stone-400">
                    Worked from
                  </label>
                  <input
                    type="text"
                    defaultValue="11:52 AM"
                    className="w-28 rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-2 text-center text-sm text-stone-700 outline-none focus:border-[#2f6f5f]"
                  />
                </div>
                <span className="mb-2.5 self-end text-stone-400">—</span>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-stone-400">
                    Worked to
                  </label>
                  <input
                    type="text"
                    defaultValue="12:52 PM"
                    className="w-28 rounded-2xl border border-stone-200 bg-[#fbfaf6] px-3 py-2 text-center text-sm text-stone-700 outline-none focus:border-[#2f6f5f]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Action Button */}
            <div className="mt-4 border-t border-stone-200 pt-4">
              <button className="w-full rounded-2xl bg-[#243c35] py-3 text-base font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-[#31564d]">
                Add Entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
