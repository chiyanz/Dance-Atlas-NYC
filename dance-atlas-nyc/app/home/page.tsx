import { useEffect, useState } from "react";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../utils/firebaseClient";
import { convertFirestoreDocToSessionData } from "../../utils/convert_data";
import { SessionData } from "../../types/dataSchema";
import { format } from "date-fns";

const Home: React.FC = () => {
  const [data, setData] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const today = format(new Date(), "yyyy-MM-dd");
        const path = `classes/Modega/${today}`;

        const collectionRef = collection(db, path);

        const querySnapshot = await getDocs(collectionRef);
        const docs = querySnapshot.docs.map((doc) =>
          convertFirestoreDocToSessionData(doc.data())
        );

        setData(docs);
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
