"use client";

import { SignOutButton } from "@components/custom/SignOutButton";
import { getUserName } from "@/lib/auth/getUserNameServerAction";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
export const DashboardPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    const userInfo = async () => {
      const name = await getUserName();
      if (name) {
        setUsername(name);
      }
    };
    userInfo();
  }, []);

  if (!session) {
    return <div>You are not logged in.</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <div>Welcome, {username}</div>
        {session.user?.image && (
          <Avatar>
            <AvatarImage src={session.user.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        )}
        <div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
};
