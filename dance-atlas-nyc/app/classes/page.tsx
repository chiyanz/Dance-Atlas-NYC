"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionData } from "../../types/dataSchema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

interface OrganizedData {
  [studioName: string]: {
    [date: string]: SessionData[];
  };
}

const Home: React.FC = () => {
  const [data, setData] = useState<OrganizedData>({});
  const [filteredData, setFilteredData] = useState<OrganizedData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudio, setSelectedStudio] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
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
    router.push("/home");
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
    <div
      className={`${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } min-h-screen w-full`}
    >
      <header className="w-full p-4 bg-gray-100 dark:bg-gray-900 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon
            className="text-md md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            icon={faMagnifyingGlass}
          />
        </div>
        <div className="space-x-2 hidden md:flex">
          <div className="shrink">
            <select
              onChange={(e) => setSelectedStudio(e.target.value)}
              value={selectedStudio}
              className={`border border-gray-300 rounded p-2 text-sm ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
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
              className={`border border-gray-300 rounded p-2 text-sm ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
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
              className={`border border-gray-300 rounded p-2 text-sm ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
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
              className={`border border-gray-300 rounded p-2 text-sm ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
            />
          </div>
        </div>
        <div className="space-x-2">
          <button
            onClick={handleHomeClick}
            className="px-2 py-1 sm:px-3 sm:py-2 bg-blue-500 text-white rounded-md text-medium sm:text-sm md:text-base lg:text-base focus:ring-4"
          >
            Home
          </button>
          <button
            onClick={handleLogoutClick}
            className="px-2 py-1 sm:px-3 sm:py-2 bg-blue-500 text-white rounded-md text-medium sm:text-sm md:text-base lg:text-base focus:ring-4"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Overlay Sidebar Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white dark:bg-gray-800 w-72 p-6 shadow-lg flex flex-col space-y-6">
            <button
              onClick={() => setMenuOpen(false)}
              className="self-end text-xl font-bold"
            >
              &times;
            </button>

            {/* Improved Dropdowns and Input Fields */}
            <div className="flex flex-col space-y-4">
              <select
                onChange={(e) => setSelectedStudio(e.target.value)}
                value={selectedStudio}
                className={`w-full border border-gray-300 rounded p-3 text-medium sm:text-sm md:text-base lg:text-base ${
                  isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
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
                className={`w-full border border-gray-300 rounded p-3 text-medium sm:text-sm md:text-base lg:text-base ${
                  isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
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
                  className={`w-full border border-gray-300 rounded p-3 text-medium sm:text-sm md:text-base lg:text-base ${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
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
                  className={`w-full border border-gray-300 rounded p-3 text-medium sm:text-sm md:text-base lg:text-base ${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
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
                            <h3 className="text-xl font-semibold mb-2">
                              {date}
                            </h3>
                            <table
                              className={`min-w-full text-md ${
                                isDarkMode
                                  ? "bg-gray-800 border-gray-600"
                                  : "bg-white border-gray-200"
                              } rounded`}
                            >
                              <thead>
                                <tr>
                                  <th
                                    className={`py-2 px-4 border-b ${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    Session
                                  </th>
                                  <th
                                    className={`py-2 px-4 border-b ${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    Instructor
                                  </th>
                                  <th
                                    className={`py-2 px-4 border-b ${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    Start Time
                                  </th>
                                  <th
                                    className={`py-2 px-4 border-b ${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    End Time
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortSessionsByStartTime(
                                  filteredData[studio][date]
                                ).map((session, index) => (
                                  <tr
                                    key={index}
                                    className={
                                      isDarkMode
                                        ? "hover:bg-gray-700"
                                        : "hover:bg-gray-100"
                                    }
                                  >
                                    <td
                                      className={`py-2 px-4 border-b text-base ${
                                        isDarkMode ? "text-white" : "text-black"
                                      }`}
                                    >
                                      <a
                                        href={session.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                      >
                                        {session.session_name}
                                      </a>
                                    </td>
                                    <td
                                      className={`py-2 px-4 border-b text-base ${
                                        isDarkMode ? "text-white" : "text-black"
                                      }`}
                                    >
                                      {session.instructor}
                                    </td>
                                    <td
                                      className={`py-2 px-4 border-b text-base ${
                                        isDarkMode ? "text-white" : "text-black"
                                      }`}
                                    >
                                      {new Date(
                                        session.start_time
                                      ).toLocaleString('en-US', {timeStyle: 'short'})}
                                    </td>
                                    <td
                                      className={`py-2 px-4 border-b text-base ${
                                        isDarkMode ? "text-white" : "text-black"
                                      }`}
                                    >
                                      {new Date(
                                        session.end_time
                                      ).toLocaleString('en-US', {timeStyle: 'short'})}
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
