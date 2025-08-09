import React from "react";
import { User } from "@prisma/client";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

type UserComponentProps = User;

export function UserComponent({ id, name, email }: UserComponentProps) {
  return (
    <Link href={`/profile/${id}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between">
            <div>{name}</div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p>Email: {email}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
