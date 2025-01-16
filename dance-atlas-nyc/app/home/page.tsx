"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import {
  type Preferences,
  type DayOfWeek,
  type Studio,
} from "@/types/preferenceSchema";
import { NavButton } from "ui/Buttons";
import Button from "@mui/material/Button";

const daysOfWeek: Array<DayOfWeek> = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const studios: Record<string, Studio> = {
  Peridance: "Peri",
  "Broadway Dance Center": "BDC",
  Modega: "Modega",
  "ILoveDance Manhattan": "ILoveDanceManhattan",
  Brickhouse: "Brickhouse",
};

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const auth = getAuth();
  const [isChanged, setIsChanged] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    instructor: "",
    style: "",
    level: "",
    dayOfWeek: new Set<DayOfWeek>(),
    studio: new Set<Studio>(),
  });

  useEffect(() => {
    if (!loading && !user) {
      console.log("user not logged in!");
      router.push("/login");
    } else if (user) {
      // Fetch user preferences from Firestore
      fetch(`/api/preferences?uid=${user.uid}`)
        .then((res) => res.json())
        .then((data) => {
          if ("error" in data) {
            console.log("error received: ", data);
          } else if (data.preferences) {
            // Merge fetched preferences with existing preferences
            setPreferences((prevPreferences) => ({
              ...prevPreferences, // Keep current state
              instructor:
                data.preferences.instructor ?? prevPreferences.instructor,
              style: data.preferences.style ?? prevPreferences.style,
              level: data.preferences.level ?? prevPreferences.level,
              dayOfWeek: data.preferences.dayOfWeek
                ? new Set(
                    Array.isArray(data.preferences.dayOfWeek)
                      ? data.preferences.dayOfWeek
                      : []
                  )
                : prevPreferences.dayOfWeek,
              studio: data.preferences.studio
                ? new Set(
                    Array.isArray(data.preferences.studio)
                      ? data.preferences.studio
                      : []
                  )
                : prevPreferences.studio,
            }));
          }
        });
    }

    // Warn the user of unsaved changes when they try to exit the page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isChanged) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, loading, router, isChanged]);

  const handleSave = async () => {
    console.log(preferences);
    if (user) {
      // Convert Sets to Arrays before sending
      const preferencesToSend = {
        ...preferences,
        dayOfWeek: Array.from(preferences.dayOfWeek),
        studio: Array.from(preferences.studio),
      };

      const res = await fetch("/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user.uid, preferences: preferencesToSend }),
      });

      const data = await res.json();
      alert(data.message || data.error);
      setIsChanged(false); // Reset unsaved changes warning after saving
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleSearch = () => {
    router.push("/classes");
  };

  const handlePreferenceChange = (
    name: keyof Preferences,
    value: DayOfWeek | Studio | string
  ) => {
    setPreferences((prevPreferences) => {
      let updatedVal;

      if (name === "dayOfWeek" || name === "studio") {
        const currentSet = new Set(prevPreferences[name] as Set<string>);

        if (currentSet.has(value as string)) {
          currentSet.delete(value as string);
        } else {
          currentSet.add(value as string);
        }

        updatedVal = currentSet;
      } else {
        updatedVal = value;
      }

      return { ...prevPreferences, [name]: updatedVal };
    });

    setIsChanged(true);
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
              <NavButton name="Search" onClick={handleSearch} />
              <NavButton name="Logout" onClick={handleLogout} />
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
            onChange={(e) =>
              handlePreferenceChange("instructor", e.target.value)
            }
            placeholder="Instructor"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
          />
          <input
            type="text"
            name="style"
            value={preferences.style}
            onChange={(e) => handlePreferenceChange("style", e.target.value)}
            placeholder="Style"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
          />
          <input
            type="text"
            name="level"
            value={preferences.level}
            onChange={(e) => handlePreferenceChange("level", e.target.value)}
            placeholder="Level"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
          />

          {/* Custom Multi-select for Day of the Week */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Preferred Days of the Week:
            </label>
            <div className="p-3 border border-gray-300 rounded-md w-full flex flex-col space-y-2">
              {daysOfWeek.map((day) => (
                <label key={day} className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Array.from(preferences.dayOfWeek).includes(day)}
                    onChange={() => handlePreferenceChange("dayOfWeek", day)}
                    className="form-checkbox h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-black dark:text-white">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Multi-select for Studio */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Preferred Studios:
            </label>
            <div className="p-3 border border-gray-300 rounded-md w-full flex flex-col space-y-2">
              {Object.keys(studios).map((studio) => (
                <label
                  key={studio}
                  className="inline-flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={Array.from(preferences.studio).includes(
                      studios[studio]
                    )}
                    onChange={() =>
                      handlePreferenceChange("studio", studios[studio])
                    }
                    className="form-checkbox h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-black dark:text-white">{studio}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
}
