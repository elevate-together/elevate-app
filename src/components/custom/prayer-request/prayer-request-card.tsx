"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PrayerRequest } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { Edit2Icon, Star } from "lucide-react";
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
    <Card className="shadow-none">
      <CardHeader className="p-5 pb-0">
        <CardTitle>
          <div className="flex flex-row justify-between items-start">
            <div className="font-normal mt-2 mb-3">{prayer.request}</div>
            <div className="flex flex-col-reverse md:flex-row ">
              <Dialog open={open} onOpenChange={setOpen}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Edit2Icon />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Prayer</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Prayer Request</DialogTitle>
                  </DialogHeader>
                  <PrayerRequestForm
                    prayer={prayer}
                    userId={userId}
                    onSubmit={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Star />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as Answered</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-6">
        <div className="flex flex-col font-normal">
          <div className="text-sm font-semibold">
            {format(new Date(prayer.createdAt), "MMMM d, yyyy")}
          </div>
          {!isSameDay(prayer.createdAt, prayer.updatedAt) && (
            <div className="text-xs">
              Last Updated: {format(prayer.updatedAt, "MM/dd/yy")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
