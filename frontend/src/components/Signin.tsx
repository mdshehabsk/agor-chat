"use client";

import {useState } from "react";

import toast from "react-hot-toast";
import useUserState from "@/state/useUserState";
import { useSigninUser } from "@/api/user/userApi";
export default function SignIn() {
  const updateState = useUserState((state) => state?.updateState);
  const [name, setName] = useState("");
  const { mutate } = useSigninUser();
  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(name, {
      onSuccess: (data) => {
        updateState({
          token: data?.token,
          userId: data?.userId,
        });
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
        }
      },
    });
  };

  return (
    <div className=" w-full h-screen flex items-center justify-center  ">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
