import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { ChatApp } from "../components/ChatApp";

export default async function Home() {
  const session = await getServerSession();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {session ? <ChatApp /> : <SignInBtn />}
    </div>
  );
}

const SignInBtn = async () => {
  return (
    <Link
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      href="/api/auth/signin"
    >
      Sign in
    </Link>
  );
};
