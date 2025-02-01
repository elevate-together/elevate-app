"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserView({
  id,
  ...props
}: { id: string } & ButtonProps) {
  const router = useRouter();
  return (
    <Button
      size="icon"
      variant="secondary"
      onClick={() => {
        router.push(`/requests/${id}`);
      }}
      {...props}
    >
      <ChevronRight />
    </Button>
  );
}
