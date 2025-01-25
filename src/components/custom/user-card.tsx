import React from "react";
import type { User } from "@/lib/definition";
import Link from "next/link";

type UserComponentProps = User;

export default function UserComponent({
  id,
  createdAt,
  name,
  email,
}: UserComponentProps) {
  return (
    <Link href={`/profile/${id}`}>
      <div
        key={id}
        className="border border-gray-200 p-4 my-4 rounded-md shadow-sm"
      >
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm text-gray-500">{createdAt}</p>
        <p className="text-gray-700">Email: {email}</p>
      </div>
    </Link>
  );
}
