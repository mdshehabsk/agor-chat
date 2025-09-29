"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SignIn from "@/components/Signin";
import useUserState from "@/state/useUserState";
const queryClient = new QueryClient();
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {userId,token} = useUserState()
  const isLogin = userId && token;
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {isLogin ? children : <SignIn/>}
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
