"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dayjs } from "dayjs";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "context/AuthContext";
import { Login, Logout } from "@mui/icons-material";
import {
  Toolbar,
  Box,
  Card,
  CardContent,
  Grid2,
  Paper,
  Chip,
  Typography,
  IconButton,
  Collapse,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import * as motion from "motion/react-client";

import { NavButton } from "ui/Buttons";
import { DateSelect, DropDownSelect } from "../../ui/SearchMenu";
import { filterClasses } from "./search";
import { ContentContainer, NavBar } from "ui/Layout";
import {
  SessionData,
  OrganizedData,
  sessionDataKeys,
} from "../../types/dataSchema";

interface ClassSessionWithStudio extends SessionData {
  studio: string;
}

const ClassesPage: React.FC = () => {
  // API State
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<OrganizedData>({});
  const [filteredClasses, setFilteredClasses] = useState<OrganizedData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDots, setLoadingDots] = useState(1);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingDots((prev) => (prev + 1) % 5);
      }, 250);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading]);

  // Filter selectors
  const [selectedStudios, setSelectedStudios] = useState<Array<string>>([
    "All",
  ]);
  const [currentStudio, setCurrentStudio] = useState<string>("All");
  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(
    null
  );
  const [selectedField, setSelectedField] =
    useState<keyof SessionData>("session_name");
  const [filterExpanded, setFilterExpanded] = useState<boolean>(false);
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

  const sortSessionsByStartTime = <T extends SessionData>(
    sessions: T[]
  ): T[] => {
    return [...sessions].sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  };

  const getAllClassesByDate = () => {
    const allClasses: { [date: string]: ClassSessionWithStudio[] } = {};

    Object.entries(filteredClasses).forEach(([studio, dates]) => {
      Object.entries(dates).forEach(([date, sessions]) => {
        if (!allClasses[date]) {
          allClasses[date] = [];
        }
        allClasses[date].push(
          ...sessions.map((session) => ({
            ...session,
            studio,
          }))
        );
      });
    });

    // Sort dates and sessions within each date
    const sortedDates = Object.keys(allClasses).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return sortedDates.reduce((acc, date) => {
      acc[date] = sortSessionsByStartTime(allClasses[date]);
      return acc;
    }, {} as { [date: string]: ClassSessionWithStudio[] });
  };

  const renderClassTable = (
    sessions: (SessionData | ClassSessionWithStudio)[],
    showStudio: boolean = false
  ) => (
    <TableContainer component={Paper} elevation={0}>
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "30%", fontWeight: 600 }}>
              Session
            </TableCell>
            <TableCell sx={{ width: "20%", fontWeight: 600 }}>
              Instructor
            </TableCell>
            {showStudio && (
              <TableCell sx={{ width: "15%", fontWeight: 600 }}>
                Studio
              </TableCell>
            )}
            <TableCell sx={{ width: "17.5%", fontWeight: 600 }}>
              Start Time
            </TableCell>
            <TableCell sx={{ width: "17.5%", fontWeight: 600 }}>
              End Time
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session, index) => (
            <TableRow
              key={index}
              hover
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell sx={{ verticalAlign: "top" }}>
                <Link
                  href={session.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="primary"
                  sx={{ fontWeight: 500 }}
                >
                  {session.session_name}
                </Link>
              </TableCell>
              <TableCell sx={{ verticalAlign: "top" }}>
                {session.instructor}
              </TableCell>
              {showStudio && "studio" in session && (
                <TableCell sx={{ verticalAlign: "top" }}>
                  {session.studio}
                </TableCell>
              )}
              <TableCell sx={{ verticalAlign: "top" }}>
                {new Date(session.start_time).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell sx={{ verticalAlign: "top" }}>
                {new Date(session.end_time).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className={"min-h-screen w-full"}>
      <NavBar>
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", padding: 2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => setFilterExpanded(!filterExpanded)}
              sx={{ borderRadius: "4px", mr: 1 }}
            >
              <FilterListIcon />
            </IconButton>
            {selectedStudios.length > 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                  {selectedStudios.map((studio) => (
                    <Chip
                      key={studio}
                      label={studio}
                      onClick={() => setCurrentStudio(studio)}
                      color={currentStudio === studio ? "primary" : "default"}
                      sx={{ mr: 1 }}
                    />
                  ))}
                </Box>
              </motion.div>
            )}
            {selectedStudios.length > 0 && selectedStudios[0] !== "All" && (
              <Chip
                label={`Studios: ${selectedStudios.length}`}
                onDelete={() => setSelectedStudios(["All"])}
                sx={{ mr: 1 }}
              />
            )}
            {selectedStartDate && (
              <Chip
                label={`Date: ${selectedStartDate.format("MM/DD/YYYY")}`}
                onDelete={() => setSelectedStartDate(null)}
                sx={{ mr: 1 }}
              />
            )}
          </Box>
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
              />
            ) : (
              <NavButton
                name="Login"
                icon={<Login />}
                onClick={handleLoginClick}
              />
            )}
          </Box>
        </Toolbar>
      </NavBar>

      <ContentContainer>
        <Collapse in={filterExpanded}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid2 container spacing={2} alignItems="center">
              <Grid2>
                <DropDownSelect
                  default={["All"]}
                  label="Studio"
                  options={["All"].concat(Object.keys(data))}
                  state={selectedStudios}
                  setState={(studios: Array<string>) => {
                    // if we previously had All, we should remove it
                    if (selectedStudios.every((s) => s === "All")) {
                      const filteredStudios = studios.filter(
                        (s) => s !== "All"
                      );
                      setSelectedStudios(filteredStudios);
                      setCurrentStudio(filteredStudios[0]);
                      return;
                    }

                    // if we choose All, might as well only keep All
                    if (studios.includes("All")) {
                      setSelectedStudios(["All"]);
                      setCurrentStudio("All");
                      return;
                    }

                    setSelectedStudios(studios);
                    if (!studios.includes(currentStudio)) {
                      setCurrentStudio(studios[0]);
                    }
                  }}
                />
              </Grid2>
              <Grid2>
                <DateSelect
                  state={selectedStartDate}
                  setState={setSelectedStartDate}
                />
              </Grid2>
              <Grid2>
                <DropDownSelect
                  label="Search By Field"
                  options={sessionDataKeys}
                  state={selectedField}
                  setState={setSelectedField}
                  multiple={false}
                />
              </Grid2>
            </Grid2>
          </Paper>
        </Collapse>

        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography>{`Loading${".".repeat(loadingDots)}`}</Typography>
          </Box>
        ) : !hasClasses ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">No classes found</Typography>
          </Box>
        ) : (
          <motion.div
            key={currentStudio}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedStudios[0] === "All" || selectedStudios.length === 1 ? (
              <Stack spacing={3} sx={{ p: 2 }}>
                {Object.entries(getAllClassesByDate()).map(
                  ([date, sessions]) => (
                    <Card key={date} elevation={2}>
                      <CardContent>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                            pb: 1,
                            mb: 2,
                          }}
                        >
                          {new Date(date).toLocaleDateString([], {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Typography>
                        {renderClassTable(sessions, true)}
                      </CardContent>
                    </Card>
                  )
                )}
              </Stack>
            ) : (
              <Stack spacing={3} sx={{ p: 2 }}>
                {Object.keys(filteredClasses)
                  .filter(
                    (studio) =>
                      currentStudio === "All" || studio === currentStudio
                  )
                  .map((studio) => (
                    <Card key={studio} elevation={2}>
                      <CardContent>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                            pb: 1,
                            mb: 2,
                          }}
                        >
                          {studio}
                        </Typography>
                        <Stack spacing={3}>
                          {getSortedDates(
                            Object.keys(filteredClasses[studio])
                          ).map(
                            (date) =>
                              filteredClasses[studio][date] &&
                              filteredClasses[studio][date].length > 0 && (
                                <div key={date}>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      mb: 2,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {new Date(date).toLocaleDateString([], {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </Typography>
                                  {renderClassTable(
                                    filteredClasses[studio][date]
                                  )}
                                </div>
                              )
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
              </Stack>
            )}
          </motion.div>
        )}
      </ContentContainer>
    </div>
  );
};

export default ClassesPage;
