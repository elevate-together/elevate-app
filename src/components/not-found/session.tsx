"use client";

import NoDataDisplay from "@/components/custom/templates/helper/no-data-display";
import { Home } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function SessionNotFound() {
  const router = useRouter();
  return (
    <NoDataDisplay
      title="You're Not Logged In"
      subtitle="We couldn't find your account information. Please log in to continue."
      icon="TriangleAlert"
      redirectButton={
        <Button variant="muted" onClick={() => router.push("/")}>
          <Home />
          Go Back Home
        </Button>
      }
    />
  );
}
