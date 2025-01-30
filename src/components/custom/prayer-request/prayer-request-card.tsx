"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PrayerRequest } from "@prisma/client";
import { useState } from "react";
import PrayerRequestForm from "./prayer-request-form";

type PrayerRequestCardProps = {
  prayer: PrayerRequest;
  userId: string;
};

export default function PrayerRequestCard({
  prayer,
  userId,
}: PrayerRequestCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="w-full p-4">
      <CardHeader>
        <CardTitle>Prayer Request</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{prayer.request}</p>
        <p className="text-sm text-gray-500 mt-2">
          Status: <span className="font-semibold">{prayer.status}</span>
        </p>

        {/* Edit button that opens the dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4">
              Edit
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogTitle>Edit:</DialogTitle>
            <PrayerRequestForm
              prayer={prayer}
              userId={userId}
              onSubmit={() => {
                setOpen(false);
              }}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
