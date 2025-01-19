"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SessionData,
  OrganizedData,
  sessionDataKeys,
} from "../../types/dataSchema";
import { NavButton } from "ui/Buttons";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "context/AuthContext";
import { Login, Logout } from "@mui/icons-material";
import {
  Toolbar,
  AppBar,
  Button,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { DateSelect, DropDownSelect } from "../../ui/SearchMenu";
import { Dayjs } from "dayjs";
import { Sidebar } from "../../ui/Sidebar";
import { filterClasses } from "./search";

const Home: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<OrganizedData>({});
  const [filteredClasses, setFilteredClasses] = useState<OrganizedData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudios, setSelectedStudios] = useState<Array<string>>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(
    null
  );
  const [selectedField, setSelectedField] =
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
          setFilteredClasses(filteredData);
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
    const filteredData = filterClasses(
      {
        start_date: selectedStartDate?.toDate(),
        studio: selectedStudios,
        searchField: selectedField,
      },
      data
    );

    setFilteredClasses(filteredData);
  }, [data, selectedStudios, selectedStartDate, selectedField]);

  const handleHomeClick = () => {
    if (!authLoading && !user) {
      router.push("/login");
    } else router.push("/home");
  };

  const handleLoginClick = () => {
    router.push("/login");
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

  const hasClasses = Object.keys(filteredClasses).some(
    (studio) =>
      filteredClasses[studio] &&
      Object.keys(filteredClasses[studio]).some(
        (date) =>
          filteredClasses[studio][date] &&
          filteredClasses[studio][date].length > 0
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
        position="fixed"
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            padding: 2,
          }}
        >
          <Tooltip title="Filter Classes">
            <IconButton
              onClick={() => setMenuOpen(!menuOpen)}
              sx={{ borderRadius: "4px" }}
            >
              <ManageSearchIcon />
            </IconButton>
          </Tooltip>
          <Box>
            <NavButton
              name="Home"
              icon={<HomeIcon />}
              onClick={handleHomeClick}
            />
            {user ? (
              <NavButton
                name="Logout"
                icon={<Logout />}
                onClick={handleLogoutClick}
              ></NavButton>
            ) : (
              <NavButton
                name="Login"
                icon={<Login />}
                onClick={handleLoginClick}
              />
            )}
          </Box>{" "}
        </Toolbar>
      </AppBar>

      {/* Overlay Sidebar Menu */}
      <Sidebar open={menuOpen} setMenuOpen={setMenuOpen}>
        <DropDownSelect
          label="Studio"
          options={["All"].concat(Object.keys(data))}
          state={selectedStudios}
          setState={(studios: Array<string>) => {
            if (studios.includes("All")) {
              setSelectedStudios(["All"]);
            } else {
              setSelectedStudios(studios);
            }
          }}
        />
        <DateSelect state={selectedStartDate} setState={setSelectedStartDate} />
        <DropDownSelect
          label="Search By Field"
          options={sessionDataKeys}
          state={selectedField}
          setState={setSelectedField}
          multiple={false}
        />
      </Sidebar>

      {loading ? (
        <div className="p-4 text-center">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="p-4">
          {!hasClasses ? (
            <div className="text-center text-large mt-10">No classes found</div>
          ) : (
            Object.keys(filteredClasses).map((studio) => (
              <div key={studio} className="mb-8">
                <h2 className="text-large font-bold mb-4">{studio}</h2>
                {getSortedDates(Object.keys(filteredClasses[studio])).map(
                  (date) => (
                    <div key={date} className="mb-6">
                      {filteredClasses[studio][date] &&
                        filteredClasses[studio][date].length > 0 && (
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
                                  filteredClasses[studio][date]
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
