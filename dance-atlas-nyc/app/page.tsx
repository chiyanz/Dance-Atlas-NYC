"use client";
import { useRouter } from "next/navigation";
import { NavButton } from "ui/Buttons";

// This page is meant to be the root landing page that can demo what the database is capable of
// Optionally include a video of how to utilize it and its features
export default function Home() {
  const router = useRouter();

  const handleSearch = () => {
    router.push("/classes");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <header className="w-full p-4 bg-gray-100 dark:bg-gray-900 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dance Atlas NYC</h1>
          <div className="space-x-4">
            <NavButton name={"Signup"} onClick={handleSignup} />
            <NavButton name={"Login"} onClick={handleLogin} />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-semibold mb-6">
          Discover Dance Classes and Events in NYC
        </h2>
        <NavButton name="Search" onClick={handleSearch} />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 p-8">
          Please note: Dance Atlas NYC is an independent, non-profit resource
          for the dance community and is not affiliated with any dance studios.
        </p>
      </main>

      <footer className="w-full p-4 bg-gray-100 dark:bg-gray-900 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Dance Atlas NYC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
