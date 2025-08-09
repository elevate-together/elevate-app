"use client";

import { Button } from "@/components/ui";
import { Loader, Trash } from "lucide-react";
import { useState } from "react";
import { deletePrayerRequest } from "@/services/prayer-request";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ButtonHandler,
  ButtonHandlerVariant,
  DrawerDialog,
} from "@/components/common";

type PrayerRequestDeleteProps = {
  requestId: string;
  variant?: ButtonHandlerVariant;
};

export function PrayerRequestDelete({
  requestId,
  variant,
}: PrayerRequestDeleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteRequest = async () => {
    setLoading(true);
    const result = await deletePrayerRequest({ id: requestId });
    if (result.success) {
      setIsOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const triggerButton = (
    <ButtonHandler
      variant={variant}
      icon={Trash}
      title={"Delete prayer request"}
      onClick={() => setIsOpen(true)}
    />
  );

  const content = (
    <div className="flex gap-2">
      <Button
        className="flex-1"
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        className="flex-1"
        type="submit"
        onClick={handleDeleteRequest}
        disabled={loading}
      >
        {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Confirm"}
      </Button>
    </div>
  );

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={content}
      title={"Delete prayer request"}
      buttonTrigger={triggerButton}
      description={
        "Are you sure you want to delete this prayer request? This action cannot be undone. This will permanently delete your prayer request."
      }
    />
  );
}
