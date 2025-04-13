"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserViewProfile({
  id,
  ...props
}: { id: string } & ButtonProps) {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      onClick={() => {
        router.push(`/user/${id}`);
      }}
      {...props}
    >
      <User />
      Profile
    </Button>
  );
}
