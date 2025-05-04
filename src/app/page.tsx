"use client";
import { signIn, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {status === "loading" && <div>Loading...</div>}
      {status === "unauthenticated" && (
        <a
          href={`/api/auth/signin`}
          onClick={(e) => {
            e.preventDefault();
            signIn();
          }}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-150 ease-in-out"
        >
          Sign in
        </a>
      )}
      {status === "authenticated" && <div>{session.user?.name}</div>}
    </div>
  );
}
