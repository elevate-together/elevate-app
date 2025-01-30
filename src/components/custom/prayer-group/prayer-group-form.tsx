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
import { Textarea } from "@/components/ui/textarea";
import { createPrayerGroup, updatePrayerGroup } from "@/services/prayer-group";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PrayerGroup } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation Schema
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name cannot be left blank",
  }),
  description: z
    .string()
    .min(1, {
      message: "Description must be at least 1 character",
    })
    .max(250, {
      message: "Description must be less than 250 characters",
    })
    .optional(),
});

type PrayerFormProps = {
  ownerId: string;
  onSubmit: (group: PrayerGroup) => void;
  onCancel: () => void; // Optional callback for the cancel action
  group?: PrayerGroup; // The group object is optional for the "create" form case
};

export default function PrayerForm({
  ownerId,
  onSubmit,
  group,
  onCancel,
}: PrayerFormProps) {
  const router = useRouter();
  // Initialize form with default values if user exists
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name || "",
    },
  });

  // Handle the form submission (for creating or updating)
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, description } = values;
    let result;

    if (group?.id) {
      // Update the user
      result = await updatePrayerGroup(group.id, values);
      router.refresh();
    } else {
      // Create a new user
      result = await createPrayerGroup({ name, ownerId, description });
    }

    if (result.success && result.prayerGroup) {
      onSubmit(result.prayerGroup);
    } else {
      toast.error(result.message || "An error occurred.");
    }

    form.reset();
  };

  // Handle the cancel action, reset the form
  const handleCancel = () => {
    form.reset({
      name: group?.name || "",
      description: group?.description || "",
    });
    onCancel();
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="flex flex-col gap-4 w-full">
            <div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Exodus '25 Group"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full min-h-32"
                        placeholder="Description (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {group?.id ? (
              <div className="flex flex-row gap-4 items-center">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            ) : (
              <div className="flex w-full flex-row gap-4 items-center">
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full">
                  Save
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
