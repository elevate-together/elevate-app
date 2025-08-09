"use client";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { updateDeviceTitle } from "@/services/device";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Device } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be left blank" }),
});

type DeviceFormProps = {
  device: Device;
  onCancel?: () => void;
  onSubmit?: () => void;
};

export function DeviceForm({ onSubmit, device, onCancel }: DeviceFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: device.title || "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { title } = values;
    let result;

    if (device.id) {
      result = await updateDeviceTitle(device.id, title);
    }
    if (result?.success) {
      router.refresh();
      if (onSubmit) {
        onSubmit();
      }
    } else {
      toast.error(result?.message || "An error occurred.");
    }

    form.reset();
  };

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
