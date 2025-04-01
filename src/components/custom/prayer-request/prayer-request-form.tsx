"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";

import { createPrayerRequest } from "@/services/prayer-request";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PrayerRequest } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { getPrayerGroupsForUser } from "@/services/user-prayer-group";

// Validation Schema
const formSchema = z.object({
  request: z.string().min(1, { message: "Request cannot be left blank" }),
  sharedWith: z
    .array(z.string().min(1))
    .min(1)
    .nonempty("Please select who you want to share it with"),
  notify: z.boolean(),
});

type UserFormProps = {
  prayer?: PrayerRequest; // The user object is optional for the "create" form case
  onCancel?: () => void; // Optional callback for the cancel action
  onSubmit?: () => void; // Optional callback for the cancel action
  isOpen?: boolean;
  userId: string;
};

export default function PrayerRequestForm({
  onSubmit,
  prayer,
  onCancel,
  isOpen = false,
  userId,
}: UserFormProps) {
  const router = useRouter();

  const [options, setOptions] = useState<
    { value: string; label: string; type: string }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (!session?.user?.id) return;
      const constants = [
        { value: "1", label: "Everyone", type: "public" },
        { value: "2", label: "Just Myself", type: "private" },
      ];

      let { prayerGroups } = await getPrayerGroupsForUser(session.user.id);
      if (!prayerGroups) prayerGroups = [];

      setOptions([
        ...constants,
        ...prayerGroups.map((group) => ({
          value: group.id,
          label: group.name,
          type: "group",
        })),
      ]);
    }

    fetchData();
  }, []);

  // Initialize form with default values if prayer exists
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: prayer?.request || "",
      sharedWith: ["1"],
      notify: true,
    },
  });

  const isNotify = form.watch("notify");

  // Handle the form submission (for creating or updating)
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { request, notify, sharedWith } = values;

    // Filter and map to include type
    const sharedWithWithType = sharedWith
      .map((id) => {
        const match = options.find((option) => option.value === id);
        return match ? { id: match.value, type: match.type } : null;
      })
      .filter((item): item is { id: string; type: string } => item !== null);

    // if (prayer?.id) {
    //   // Update the prayer request
    //   result = await updatePrayerRequest(prayer.id, { request });
    // } else {
    //   // Create a new prayer request
    const result = await createPrayerRequest({
      request,
      notify,
      sharedWith: sharedWithWithType,
      userId,
    });
    // }

    if (result.success && result?.prayerRequest) {
      toast.success(result.message);
      router.refresh();
      if (onSubmit) {
        onSubmit();
      }
    } else {
      toast.error(result.message);
    }

    resetForm();
  };

  // Handle the cancel action, reset the form
  const resetForm = () => {
    form.reset({
      request: prayer?.request || "",
      notify: true,
    });
    form.setValue("sharedWith", ["1"], { shouldDirty: true });
  };

  // Handle the cancel action, reset the form
  const handleCancel = () => {
    resetForm();

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col justify-center gap-2">
              <FormLabel>Share With</FormLabel>
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="sharedWith"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <MultiSelect
                          options={options}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          specialSelection
                          placeholder="Request Visibility"
                          modalPopover={true}
                          isParentOpen={isOpen}
                          maxCount={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Toggle
                          pressed={field.value}
                          onPressedChange={field.onChange}
                          aria-label="Toggle italic"
                        >
                          <Bell className="h-4 w-4" />
                        </Toggle>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription>
                Everyone selected will have access to this request—you can
                update it anytime.
                {isNotify
                  ? " Notifications will be sent to all selected recipients. Toggle to disable."
                  : " Notifications are disabled. Toggle to enable and notify selected recipients of your request."}
              </FormDescription>
            </div>
            <FormField
              control={form.control}
              name="request"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[280px] md:min-h-[150px]"
                      placeholder="Enter your prayer request here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Save
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
