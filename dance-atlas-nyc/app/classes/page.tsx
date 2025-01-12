"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionData } from "../../types/dataSchema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { NavButton } from "ui/Buttons";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "context/AuthContext";
import { Logout } from "@mui/icons-material";
import { Toolbar, AppBar, Button, IconButton } from "@mui/material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import CloseIcon from "@mui/icons-material/Close";

interface OrganizedData {
  [studioName: string]: {
    [date: string]: SessionData[];
  };
}

const Home: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<OrganizedData>({});
  const [filteredData, setFilteredData] = useState<OrganizedData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudio, setSelectedStudio] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchColumn, setSearchColumn] =
    useState<keyof SessionData>("session_name");
  const [searchText, setSearchText] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("/api");
        if (response.ok) {
          const data: OrganizedData = await response.json();

          // Filter out past dates based on EST timezone
          const now = new Date();
          const estOffset = -5 * 60; // EST offset in minutes
          const today = new Date(now.getTime() + estOffset * 60 * 1000);
          today.setHours(0, 0, 0, 0); // Set to midnight

          const filteredData = Object.keys(data).reduce((acc, studio) => {
            const filteredDates = Object.keys(data[studio])
              .filter((date) => {
                const sessionDate = new Date(date);
                return sessionDate >= today;
              })
              .reduce((acc, date) => {
                acc[date] = data[studio][date];
                return acc;
              }, {} as { [date: string]: SessionData[] });

            if (Object.keys(filteredDates).length > 0) {
              acc[studio] = filteredDates;
            }

            return acc;
          }, {} as OrganizedData);

          setData(filteredData);
          setFilteredData(filteredData);
        } else {
          console.error("Failed to fetch data from API");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filterData = () => {
      let filtered = JSON.parse(JSON.stringify(data));
      console.log("data: ", data);
      console.log(filtered);
      if (selectedStudio) {
        filtered = { [selectedStudio]: filtered[selectedStudio] };
      }
      if (selectedDate) {
        Object.keys(filtered).forEach((studio) => {
          filtered[studio] = { [selectedDate]: filtered[studio][selectedDate] };
        });
      }

      // Apply search filter
      Object.keys(filtered).forEach((studio) => {
        Object.keys(filtered[studio]).forEach((date) => {
          filtered[studio][date] = filtered[studio][date].filter(
            (session: SessionData) =>
              new RegExp(searchText, "i").test(session[searchColumn] as string)
          );
        });
      });

      setFilteredData(filtered);
    };

    filterData();
  }, [data, selectedStudio, selectedDate, searchColumn, searchText]);

  const handleHomeClick = () => {
    if (!authLoading && !user) {
      router.push("/login");
    } else router.push("/home");
  };

  const handleLogoutClick = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/");
  };

  const getSortedDates = (dates: string[]) => {
    return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  const hasClasses = Object.keys(filteredData).some(
    (studio) =>
      filteredData[studio] &&
      Object.keys(filteredData[studio]).some(
        (date) =>
          filteredData[studio][date] && filteredData[studio][date].length > 0
      )
  );

  const sortSessionsByStartTime = (sessions: SessionData[]) => {
    return sessions.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  };

  return (
    <div className={"min-h-screen w-full"}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "gray.100",
          boxShadow: 3,
          width: "100%",
          "&.MuiAppBar-root": {
            backgroundColor: "background.default", // You can use theme for dark mode
          },
          flex: "row",
        }}
      >
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", padding: 2 }}
        >
          <IconButton
            onClick={() => setMenuOpen(!menuOpen)}
            sx={{ borderRadius: "4px" }}
          >
            <ManageSearchIcon />
          </IconButton>
          <div className="space-x-2 hidden md:flex">
            <div className="shrink">
              <select
                onChange={(e) => setSelectedStudio(e.target.value)}
                value={selectedStudio}
                className={
                  "border border-gray-300 rounded p-2 text-medium sm:text-sm md:text-base lg:text-base"
                }
              >
                <option value="">All Studios</option>
                {Object.keys(data).map((studio) => (
                  <option key={studio} value={studio}>
                    {studio}
                  </option>
                ))}
              </select>
            </div>
            <div className="shrink">
              <select
                onChange={(e) => setSelectedDate(e.target.value)}
                value={selectedDate}
                className={`border border-gray-300 rounded p-2 text-medium sm:text-sm md:text-base lg:text-base`}
              >
                <option value="">All Dates</option>
                {Array.from(
                  new Set(
                    Object.keys(data).flatMap((studio) =>
                      Object.keys(data[studio])
                    )
                  )
                )
                  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                  .map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex items-center">
              <select
                onChange={(e) =>
                  setSearchColumn(e.target.value as keyof SessionData)
                }
                value={searchColumn}
                className={`border border-gray-300 rounded p-2 text-medium sm:text-sm md:text-base lg:text-base`}
              >
                <option value="session_name">Session Name</option>
                <option value="instructor">Instructor</option>
                <option value="start_time">Start Time</option>
                <option value="end_time">End Time</option>
              </select>
              <input
                type="text"
                onChange={(e) => {
                  console.log(e.target.value);
                  setSearchText(e.target.value);
                }}
                value={searchText}
                placeholder="Search"
                className={`border border-gray-300 rounded p-2 text-medium sm:text-sm md:text-base lg:text-base`}
              />
            </div>
          </div>
          <div className="space-x-2">
            <NavButton
              name="Home"
              icon={<HomeIcon />}
              onClick={handleHomeClick}
            />
            <NavButton
              name="Logout"
              icon={<Logout />}
              onClick={handleLogoutClick}
            ></NavButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* Overlay Sidebar Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white dark:bg-gray-800 w-72 p-6 shadow-lg flex flex-col space-y-6">
            <IconButton
              sx={{
                width: "auto",
                alignSelf: "flex-start",
                alignContent: "center",
                padding: "8px 8px",
                //override IconButton's default round border
                borderRadius: "4px",
              }}
              onClick={() => setMenuOpen(false)}
            >
              <CloseIcon />
            </IconButton>
            {/* Improved Dropdowns and Input Fields */}
            <div className="flex flex-col space-y-4">
              <select
                onChange={(e) => setSelectedStudio(e.target.value)}
                value={selectedStudio}
                className={`w-full border border-gray-300 rounded p-3 text-medium sm:text-sm md:text-base lg:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">All Studios</option>
                {Object.keys(data).map((studio) => (
                  <option key={studio} value={studio}>
                    {studio}
                  </option>
                ))}
              </select>

              <select
                onChange={(e) => setSelectedDate(e.target.value)}
                value={selectedDate}
                className={`w-full border border-gray-300 rounded p-3 text-medium sm:text-sm md:text-base lg:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">All Dates</option>
                {Array.from(
                  new Set(
                    Object.keys(data).flatMap((studio) =>
                      Object.keys(data[studio])
                    )
                  )
                )
                  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                  .map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
              </select>

              {/* Supporting Text for Coupled Elements */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Search by:
                </label>
                <select
                  onChange={(e) =>
                    setSearchColumn(e.target.value as keyof SessionData)
                  }
                  value={searchColumn}
                  className={`w-full border border-gray-300 rounded p-3 text-medium sm:text-sm md:text-base lg:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                >
                  <option value="session_name">Session Name</option>
                  <option value="instructor">Instructor</option>
                  <option value="start_time">Start Time</option>
                  <option value="end_time">End Time</option>
                </select>
                <input
                  type="text"
                  onChange={(e) => {
                    console.log(e.target.value);
                    setSearchText(e.target.value);
                  }}
                  value={searchText}
                  placeholder="Search"
                  className={`w-full border border-gray-300 rounded p-3 text-medium sm:text-sm md:text-base lg:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-4 text-center">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="p-4">
          {!hasClasses ? (
            <div className="text-center text-large mt-10">No classes found</div>
          ) : (
            Object.keys(filteredData).map((studio) => (
              <div key={studio} className="mb-8">
                <h2 className="text-large font-bold mb-4">{studio}</h2>
                {getSortedDates(Object.keys(filteredData[studio])).map(
                  (date) => (
                    <div key={date} className="mb-6">
                      {filteredData[studio][date] &&
                        filteredData[studio][date].length > 0 && (
                          <div className="overflow-x-auto">
                            <h3 className="text-medium font-semibold mb-2">
                              {date}
                            </h3>
                            <table className={`min-w-full text-small rounded`}>
                              <thead>
                                <tr>
                                  <th className={`py-2 px-4 border-b`}>
                                    Session
                                  </th>
                                  <th className={`py-2 px-4 border-b`}>
                                    Instructor
                                  </th>
                                  <th className={`py-2 px-4 border-b`}>
                                    Start Time
                                  </th>
                                  <th className={`py-2 px-4 border-b`}>
                                    End Time
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortSessionsByStartTime(
                                  filteredData[studio][date]
                                ).map((session, index) => (
                                  <tr key={index}>
                                    <td className={`py-2 px-4 border-b`}>
                                      <a
                                        href={session.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                      >
                                        {session.session_name}
                                      </a>
                                    </td>
                                    <td className={`py-2 px-4 border-b`}>
                                      {session.instructor}
                                    </td>
                                    <td className={`py-2 px-4 border-b`}>
                                      {new Date(
                                        session.start_time
                                      ).toLocaleString()}
                                    </td>
                                    <td className={`py-2 px-4 border-b`}>
                                      {new Date(
                                        session.end_time
                                      ).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                    </div>
                  )
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
