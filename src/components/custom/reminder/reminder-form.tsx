"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addReminder } from "@/services/reminder";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { TimePicker } from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import { ZoneType } from "@prisma/client";
import { convertUTCToZoneTime, convertZoneTimeToUTC } from "@/lib/utils";

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  frequency: z.enum(["daily", "weekly"]),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"),
  dayOfWeek: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

type ReminderFormProps = {
  userId: string;
  timeZone: ZoneType;
  reminderText?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export default function ReminderForm({
  userId,
  timeZone,
  reminderText = "",
  onSubmit,
  onCancel,
}: ReminderFormProps) {
  const router = useRouter();
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "Reminder",
      message: reminderText,
      frequency: "daily",
      reminderTime: convertUTCToZoneTime("13:00", timeZone),
      dayOfWeek: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ReminderFormValues) => {
    setLoading(true);

    const result = await addReminder({
      userId,
      ...values,
      time: convertZoneTimeToUTC(values.reminderTime, timeZone),
      timeZone,
    });

    if (result.success) {
      router.refresh();
      if (onSubmit) {
        onSubmit();
      }
      form.reset();
    } else {
      toast.error(result.message || "Failed to create reminder.");
    }

    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    {/* <SelectItem value="weekly">Weekly</SelectItem> */}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* {frequency === "weekly" && (
          <FormField
            control={form.control}
            name="dayOfWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Day of Week</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )} */}

        <FormField
          control={form.control}
          name="reminderTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <TimePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder</FormLabel>
              <FormControl>
                <Textarea
                  className="bg-transparent min-h-[200px]"
                  placeholder="Reminder message"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row gap-4">
          <Button variant="outline" className="w-full" onClick={onCancel}>
            {loading ? <Loader className="animate-spin" /> : "Cancel"}
          </Button>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : "Create Reminder"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
