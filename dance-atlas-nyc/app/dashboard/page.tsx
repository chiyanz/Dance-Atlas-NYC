"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log("user is not signed in");
      router.push("/login"); // Redirect to login if not logged in
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-black dark:text-white">
          Dashboard
        </h1>
        {user && (
          <div className="text-center text-black dark:text-white">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {/* Display other user information as needed */}
          </div>
        )}
      </div>
    </div>
  );
}
