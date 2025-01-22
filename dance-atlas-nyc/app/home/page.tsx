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
import {
  Box,
  Card,
  Container,
  Slide,
  SlideProps,
  Snackbar,
  SnackbarCloseReason,
  Toolbar,
  Tooltip,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
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

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

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
  const [popupOpen, setPopupOpen] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setPreferencesLoading(true);
      fetch(`/api/preferences?uid=${user.uid}`)
        .then((res) => res.json())
        .then((data) => {
          if ("error" in data) {
          } else if (data.preferences) {
            setPreferences((prevPreferences) => ({
              ...prevPreferences,
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
        })
        .finally(() => {
          setPreferencesLoading(false);
        });
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isChanged) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, loading]);

  const handleSave = async () => {
    if (user) {
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
      setPopupOpen(true);
      setIsChanged(false);
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

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setPopupOpen(false);
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
        <Card sx={{ padding: 2, margin: 2 }}>
          <Container
            sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}
          >
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
            />
          </Container>
          <Tooltip
            title={
              isChanged
                ? "Save updated preferences"
                : "No changes have been made"
            }
          >
            <span>
              <Button
                sx={{ margin: 3 }}
                disabled={!isChanged}
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Preferences
              </Button>
            </span>
          </Tooltip>
        </Card>
        <Snackbar
          open={popupOpen}
          onClose={handleClose}
          message="Preferences saved successfully!"
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={SlideTransition}
          autoHideDuration={2000}
        />
      </ContentContainer>
      <Backdrop
        open={preferencesLoading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
