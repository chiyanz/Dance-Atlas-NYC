"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { type Preferences } from "@/types/preferenceSchema";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const studios = [
  "Peridance Center",
  "Broadway Dance Center",
  "Modega",
  "Brickhouse",
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const auth = getAuth();
  const [preferences, setPreferences] = useState<Preferences>({
    instructor: "",
    style: "",
    level: "",
    dayOfWeek: "",
    studio: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      console.log("user not logged in!");
      router.push("/login"); // Redirect to login if not logged in
    } else if (user) {
      // Fetch user preferences from Firestore
      fetch(`/api/preferences?uid=${user.uid}`)
        .then((res) => res.json())
        .then((data) => {
          if ("error" in data) {
            console.log("error received: ", data);
          }
          if (data.preferences) {
            setPreferences(data.preferences);
          }
        });
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    if (user) {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user.uid, preferences }),
      });
      const data = await res.json();
      alert(data.message || data.error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleSearch = () => {
    router.push("/classes");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <header className="w-full p-4 bg-gray-100 dark:bg-gray-900 shadow-md">
          <div className="mb-2 flex flex-wrap items-center justify-between">
            <div className="flex space-x-4">
              <h1 className="text-2xl font-semibold text-black dark:text-white">
                My Preferences
              </h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
              >
                Search
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-xl mx-auto">
        <div className="space-y-4">
          <input
            type="text"
            name="instructor"
            value={preferences.instructor}
            onChange={handleChange}
            placeholder="Instructor"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
          />
          <input
            type="text"
            name="style"
            value={preferences.style}
            onChange={handleChange}
            placeholder="Style"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
          />
          <input
            type="text"
            name="level"
            value={preferences.level}
            onChange={handleChange}
            placeholder="Level"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
          />
          <select
            name="dayOfWeek"
            value={preferences.dayOfWeek}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
          >
            <option value="">Select Day of the Week</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <select
            name="studio"
            value={preferences.studio}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
          >
            <option value="">Select Studio</option>
            {studios.map((studio) => (
              <option key={studio} value={studio}>
                {studio}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white py-3 mt-4 rounded-md hover:bg-blue-700 transition duration-300 w-full"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
