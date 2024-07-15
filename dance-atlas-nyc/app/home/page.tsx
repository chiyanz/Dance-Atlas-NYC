"use client";
import { useEffect, useState } from "react";
import { SessionData } from "../../types/dataSchema";

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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("/api");
        if (response.ok) {
          const data: OrganizedData = await response.json();
          setData(data);
          setFilteredData(data);
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
    filterData();
  }, [selectedStudio, selectedDate]);

  const filterData = () => {
    let filtered = { ...data };
    if (selectedStudio) {
      filtered = { [selectedStudio]: filtered[selectedStudio] };
    }
    if (selectedDate) {
      Object.keys(filtered).forEach((studio) => {
        if (filtered[studio]) {
          filtered[studio] = { [selectedDate]: filtered[studio][selectedDate] };
        }
      });
    }
    setFilteredData(filtered);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
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

  return (
    <div
      className={`p-6 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } min-h-screen`}
    >
      <button
        onClick={toggleDarkMode}
        className="mb-4 p-2 border border-gray-300 rounded bg-gray-200 dark:bg-gray-700"
      >
        Toggle Dark Mode
      </button>
      {loading ? (
        <div className="text-center">
          <p>Loading...</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex space-x-4">
            <div>
              <label className="mr-2">Studio: </label>
              <select
                onChange={(e) => setSelectedStudio(e.target.value)}
                value={selectedStudio}
                className={`border border-gray-300 rounded p-2 ${
                  isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                }`}
              >
                <option value="">All</option>
                {Object.keys(data).map((studio) => (
                  <option key={studio} value={studio}>
                    {studio}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mr-2">Date: </label>
              <select
                onChange={(e) => setSelectedDate(e.target.value)}
                value={selectedDate}
                className={`border border-gray-300 rounded p-2 ${
                  isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                }`}
              >
                <option value="">All</option>
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
          </div>
          {!hasClasses ? (
            <div className="text-center text-xl mt-10">No classes found</div>
          ) : (
            Object.keys(filteredData).map((studio) => (
              <div key={studio} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{studio}</h2>
                {getSortedDates(Object.keys(filteredData[studio])).map(
                  (date) => (
                    <div key={date} className="mb-6">
                      <h3 className="text-xl font-semibold mb-2">{date}</h3>
                      {filteredData[studio][date] &&
                      filteredData[studio][date].length > 0 ? (
                        <table
                          className={`min-w-full ${
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
                            {filteredData[studio][date].map(
                              (session, index) => (
                                <tr
                                  key={index}
                                  className={
                                    isDarkMode
                                      ? "hover:bg-gray-700"
                                      : "hover:bg-gray-100"
                                  }
                                >
                                  <td
                                    className={`py-2 px-4 border-b ${
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
                                    className={`py-2 px-4 border-b ${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {session.instructor}
                                  </td>
                                  <td
                                    className={`py-2 px-4 border-b ${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {new Date(
                                      session.start_time
                                    ).toLocaleString()}
                                  </td>
                                  <td
                                    className={`py-2 px-4 border-b ${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {new Date(
                                      session.end_time
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center text-xl mt-10">
                          No matching classes
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
