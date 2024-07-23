"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const auth = getAuth();
  const [preferences, setPreferences] = useState("");
  

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
            console.log("error recieved: ", data);
          }
          setPreferences(data.preferences || "");
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
        <textarea
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          rows={6}
          placeholder="Enter your class preferences here..."
        />
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
