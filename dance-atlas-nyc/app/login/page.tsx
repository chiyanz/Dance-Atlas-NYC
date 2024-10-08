"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { resolve } from "path";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      try {
        await signInWithCustomToken(auth, data.token);
        setMessage("Signed in successfully! Redirecting...");
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
        router.push("/classes");
      } catch (error) {
        setMessage("Sign in failed ;-;");
      }
    } else {
      setMessage(data.message || data.error);
    }
  };

  const handleLanding = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="w-full p-4 bg-gray-100 dark:bg-gray-900 shadow-md">
        <div className="mb-2 flex flex-wrap items-center justify-start">
          <div className="flex space-x-4">
            <FontAwesomeIcon
              onClick={handleLanding}
              icon={faArrowLeft}
              className="mr-2 text-gray-800"
            />
          </div>
        </div>
      </header>
      <div className="p-4 flex flex-col items-center justify-start min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-6 text-center text-black dark:text-white">
            Login
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
          <div className="mt-4 text-center">
            <Link href="/signup" className="text-blue-600 dark:text-blue-400">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
