"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useSignupUser } from "@/api/user/userApi";


export default function SignUp() {
    const {mutate} = useSignupUser()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    mutate(
      { username, password },
      {
        onSuccess: () => {
          
          toast.success("Account created successfully!");
        },
        onError: (data: unknown) => {
          // ✅ First ensure `data` is a non-null object
          if (
            data &&
            typeof data === "object" &&
            "message" in data &&
            typeof data?.message === "string"
          ) {
            toast?.error(data?.message);
          } else {
            toast?.error("Something went wrong. Please try again.");
          }
        },
      }
    );
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}