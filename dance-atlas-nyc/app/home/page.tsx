"use client";
import { useEffect, useState } from "react";
import { SessionData } from "../../types/dataSchema";

const Home: React.FC = () => {
  const [data, setData] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("/api/classes");
        if (response.ok) {
          const data: SessionData[] = await response.json();
          setData(data);
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

  return (
    <div>
      {loading ? (
        <div>
          <p>Placeholder loading indicator</p>
        </div>
      ) : (
        <ul>
          {data.map((item, index) => (
            <li key={index}>
              <p>Session: {item.session_name}</p>
              <p>Instructor: {item.instructor}</p>
              <p>Location: {item.location}</p>
              <p>Start Time: {item.start_time.toLocaleString()}</p>
              <p>End Time: {item.end_time.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;
