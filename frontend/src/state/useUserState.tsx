"use client";

import { create } from "zustand";

type TState = {
  token: string;
  userId: string;
  updateState: (args: { token: string; userId: string }) => void;
};

const STORAGE_KEY = "userState";
const EXPIRY_MS = 50 * 60 * 1000; // 50 minutes

// Helper to read from localStorage and validate expiry
function getInitialState() {
  if (typeof window === "undefined") return { token: "", userId: "" };

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: "", userId: "" };

  try {
    const data = JSON.parse(raw) as {
      token: string;
      userId: string;
      expiresAt: number;
    };
    if (Date.now() < data.expiresAt) {
      return { token: data.token, userId: data.userId };
    } else {
      localStorage.removeItem(STORAGE_KEY); // expired
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { token: "", userId: "" };
}

const useUserState = create<TState>((set) => ({
  ...getInitialState(),

  updateState: ({ token, userId }) => {
    const expiresAt = Date.now() + EXPIRY_MS;

    // store to localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, userId, expiresAt })
    );

    // update Zustand state
    set({ token, userId });
  },
}));

export default useUserState;
