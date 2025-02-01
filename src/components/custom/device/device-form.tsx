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
import { updateDeviceTitle } from "@/services/device";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Device } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation Schema
const formSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be left blank" }),
});

type UserFormProps = {
  device: Device;
  onCancel?: () => void; // Optional callback for the cancel action
  onSubmit?: () => void; // Optional callback for the submit action
};

export default function DeviceForm({
  onSubmit,
  device,
  onCancel,
}: UserFormProps) {
  const router = useRouter();

  // Initialize form with default values if prayer exists
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: device?.title || "",
    },
  });

  // Handle the form submission (for creating or updating)
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { title } = values;
    let result;

    if (device?.id) {
      // Update the prayer request
      result = await updateDeviceTitle(device.id, title);
    }
    if (result?.success) {
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
      title: device?.title || "",
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
              name="title"
              render={({ field }) => (
                <FormItem className="w-full text-left">
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Device Name " {...field} />
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
