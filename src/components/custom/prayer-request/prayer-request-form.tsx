"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPrayerRequest,
  updatePrayerRequest,
} from "@/services/prayer-request";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PrayerRequest } from "@prisma/client";
import { PrayerRequestStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation Schema
const formSchema = z.object({
  request: z.string().min(1, { message: "Request cannot be left blank" }),
  status: z.nativeEnum(PrayerRequestStatus).optional(),
});

type UserFormProps = {
  prayer?: PrayerRequest; // The user object is optional for the "create" form case
  onCancel?: () => void; // Optional callback for the cancel action
  onSubmit?: () => void; // Optional callback for the cancel action
  userId: string;
};

export default function PrayerRequestForm({
  onSubmit,
  prayer,
  onCancel,
  userId,
}: UserFormProps) {
  const router = useRouter();

  // Initialize form with default values if prayer exists
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: prayer?.request || "",
      status: prayer?.status || PrayerRequestStatus.IN_PROGRESS, // Use the enum instead of a string
    },
  });

  // Handle the form submission (for creating or updating)
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { request, status } = values;
    let result;

    if (prayer?.id) {
      // Update the prayer request
      result = await updatePrayerRequest(prayer.id, { request, status });
    } else {
      // Create a new prayer request
      result = await createPrayerRequest({ request, status, userId });
    }

    if (result?.success && result?.prayerRequest) {
      toast.success(result?.message || "An error occurred.");
      router.refresh();
      if (onSubmit) {
        onSubmit();
      }
    } else {
      toast.error(result?.message || "An error occurred.");
    }

    form.reset();
  };

  // Handle the cancel action, reset the form
  const handleCancel = () => {
    form.reset({
      request: prayer?.request || "",
      status: prayer?.status || PrayerRequestStatus.IN_PROGRESS,
    });

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="request"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your prayer request here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Dropdown */}
            {prayer?.id && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PrayerRequestStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Buttons */}
            {prayer?.id ? (
              <div className="flex flex-row gap-4 items-center">
                <Button
                  className="w-full"
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button className="w-full" type="submit">
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex flex-row gap-4 items-center w-full">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button className="w-full" type="submit">
                  Submit
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
