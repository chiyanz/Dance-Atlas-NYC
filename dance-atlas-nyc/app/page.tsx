"use client";
import { useRouter } from "next/navigation";

// This page is meant to be the root landing page that can demo what the database is capable of
// Optionally include a video of how to utilize it and its features
export default function Home() {
  const router = useRouter();

  const handleSearchClick = () => {
    router.push("/classes");
  };

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleSignupClick = () => {
    router.push("/signup");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <header className="w-full p-4 bg-gray-100 dark:bg-gray-900 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dance Atlas NYC</h1>
          <div className="space-x-4">
            <button
              onClick={handleSignupClick}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm focus:ring-4"
            >
              Sign Up
            </button>
            <button
              onClick={handleLoginClick}
              className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm focus:ring-4"
            >
              Log In
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center bg-home bg-cover bg-center">
        <div className="bg-gray-50 bg-opacity-85 p-4">
        <h2 className="text-4xl font-semibold mb-6">
          Discover Dance Classes and Events in NYC
        </h2>
        <button
          onClick={handleSearchClick}
          className="px-6 py-3 bg-blue-600 text-white text-lg rounded-md mb-12 focus:ring-4"
        >
          Search
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Please note: Dance Atlas NYC is an independent, non-profit resource
          for the dance community and is not affiliated with any dance studios.
        </p>
        </div>
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
