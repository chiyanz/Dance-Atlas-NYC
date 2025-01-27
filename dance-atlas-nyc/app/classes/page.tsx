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
  Box,
  Card,
  CardContent,
  Grid,
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
import { DateSelect, DropDownSelect } from "../../ui/SearchMenu";
import { Dayjs } from "dayjs";
import { filterClasses } from "./search";
import { ContentContainer, NavBar } from "ui/Layout";

interface ClassSessionWithStudio extends SessionData {
  studio: string;
}

const ClassesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<OrganizedData>({});
  const [filteredClasses, setFilteredClasses] = useState<OrganizedData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudios, setSelectedStudios] = useState<Array<string>>([
    "All",
  ]);
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
          <Box>
            <IconButton
              onClick={() => setFilterExpanded(!filterExpanded)}
              sx={{ borderRadius: "4px", mr: 1 }}
            >
              <FilterListIcon />
            </IconButton>
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
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <DropDownSelect
                  default={["All"]}
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
              </Grid>
              <Grid item xs={12} sm={4}>
                <DateSelect
                  state={selectedStartDate}
                  setState={setSelectedStartDate}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DropDownSelect
                  label="Search By Field"
                  options={sessionDataKeys}
                  state={selectedField}
                  setState={setSelectedField}
                  multiple={false}
                />
              </Grid>
            </Grid>
          </Paper>
        </Collapse>

        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : !hasClasses ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">No classes found</Typography>
          </Box>
        ) : selectedStudios[0] === "All" ? (
          <Stack spacing={3} sx={{ p: 2 }}>
            {Object.entries(getAllClassesByDate()).map(([date, sessions]) => (
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
            ))}
          </Stack>
        ) : (
          <Stack spacing={3} sx={{ p: 2 }}>
            {Object.keys(filteredClasses).map((studio) => (
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
                    {getSortedDates(Object.keys(filteredClasses[studio])).map(
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
                            {renderClassTable(filteredClasses[studio][date])}
                          </div>
                        )
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </ContentContainer>
    </div>
  );
};

export default ClassesPage;
