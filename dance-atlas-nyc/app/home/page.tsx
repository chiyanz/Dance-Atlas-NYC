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
import SearchIcon from "@mui/icons-material/Search";
import { AppBar, Box, Card, Toolbar } from "@mui/material";
import { Logout } from "@mui/icons-material";
import { ContentContainer, NavBar } from "ui/Layout";
import { DropDownSelect } from "ui/SearchMenu";
import BiMap from "bidirectional-map";

const daysOfWeek: Array<DayOfWeek> = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const studios = new BiMap<string>();
studios.set("Peri", "Peridance");
studios.set("BDC", "Broadway Dance Center");
studios.set("Modega", "Modega");
studios.set("ILoveDanceManhattan", "ILoveDance Manhattan");
studios.set("Brickhouse", "Brickhouse");

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
    value: Array<DayOfWeek> | Array<Studio> | string
  ) => {
    setPreferences((prevPreferences) => {
      let updatedVal;

      if (name === "dayOfWeek" || name === "studio") {
        updatedVal = new Set(value);
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
    <div className="min-h-screen">
      <NavBar>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            padding: 2,
          }}
        >
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            My Preferences
          </h1>
          <Box>
            <NavButton
              name="Search"
              icon={<SearchIcon />}
              onClick={handleSearch}
            />
            <NavButton name="Logout" icon={<Logout />} onClick={handleLogout} />
          </Box>
        </Toolbar>
      </NavBar>
      <ContentContainer>
        <Card>
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

            <DropDownSelect
              label="Days of the Week"
              options={daysOfWeek}
              state={Array.from(preferences.dayOfWeek)}
              setState={(day) => {
                handlePreferenceChange("dayOfWeek", day);
              }}
            />

            <DropDownSelect
              label="Studios"
              options={Array.from(studios.values())}
              // the studios record maps from studio name in the DB to a more readable string
              state={Array.from(preferences.studio).map((dbName) =>
                studios.get(dbName)
              )}
              setState={(selectedStudios) => {
                handlePreferenceChange(
                  "studio",
                  selectedStudios.map((displayName: string) =>
                    studios.getKey(displayName)
                  )
                );
              }}
              // render={(dbName) => studios.get(dbName)}
            />
          </div>
          <Button onClick={handleSave}>Save Preferences</Button>
        </Card>
      </ContentContainer>
    </div>
  );
}
