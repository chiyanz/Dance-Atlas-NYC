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
        filtered[studio] = { [selectedDate]: filtered[studio][selectedDate] };
      });
    }
    setFilteredData(filtered);
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="text-center">
          <p>Loading...</p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <label className="mr-2">Studio: </label>
            <select
              onChange={(e) => setSelectedStudio(e.target.value)}
              value={selectedStudio}
              className="border border-gray-300 rounded p-2 text-black"
            >
              <option value="">All</option>
              {Object.keys(data).map((studio) => (
                <option key={studio} value={studio}>
                  {studio}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="mr-2">Date: </label>
            <select
              onChange={(e) => setSelectedDate(e.target.value)}
              value={selectedDate}
              className="border border-gray-300 rounded p-2 text-black"
            >
              <option value="">All</option>
              {Array.from(
                new Set(
                  Object.keys(data).flatMap((studio) =>
                    Object.keys(data[studio])
                  )
                )
              ).map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
          {Object.keys(filteredData).map((studio) => (
            <div key={studio} className="mb-6">
              <h2 className="text-xl font-bold mb-2">{studio}</h2>
              {Object.keys(filteredData[studio]).map((date) => (
                <div key={date} className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">{date}</h3>
                  <ul className="list-disc list-inside">
                    {filteredData[studio][date].map((session, index) => (
                      <li key={index} className="mb-2">
                        <p>
                          <strong>Session:</strong> {session.session_name}
                        </p>
                        <p>
                          <strong>Instructor:</strong> {session.instructor}
                        </p>
                        <p>
                          <strong>Location:</strong> {session.location}
                        </p>
                        <p>
                          <strong>Start Time:</strong>{" "}
                          {new Date(session.start_time).toLocaleString()}
                        </p>
                        <p>
                          <strong>End Time:</strong>{" "}
                          {new Date(session.end_time).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
