"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addReminder, updateReminder } from "@/services/reminder";
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
import { Reminder, ReminderFrequency, User } from "@prisma/client";
import {
  convertUTCToZoneTime,
  convertZoneTimeToUTC,
  getIanafromEnumKey,
} from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  frequency: z.nativeEnum(ReminderFrequency),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"),
  dayOfWeek: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

type ReminderFormProps = {
  user: User;
  reminder?: Reminder;
  reminderText?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export default function ReminderForm({
  user,
  reminder,
  reminderText = "",
  onSubmit,
  onCancel,
}: ReminderFormProps) {
  const router = useRouter();
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: reminder?.title || "Reminder",
      message: reminder?.message || reminderText,
      frequency: reminder?.frequency || ReminderFrequency.DAILY,
      reminderTime: convertUTCToZoneTime("13:00", user.timeZone),
      dayOfWeek: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState("Saving Changes...");

  const handleSubmit = async (values: ReminderFormValues) => {
    setLoading(true);
    let result;

    if (reminder?.id) {
      setLoadingText("Saving Changes...");
      setUploadProgress(50);
      result = await updateReminder({
        reminderId: reminder.id,
        userId: user.id,
        title: values.title,
        message: values.message,
        frequency: values.frequency,
        time: convertZoneTimeToUTC(values.reminderTime, user.timeZone),
        timeZone: user.timeZone,
      });
    } else {
      setLoadingText("Creating Reminder...");
      setUploadProgress(50);
      result = await addReminder({
        userId: user.id,
        title: values.title,
        message: values.message,
        frequency: values.frequency,
        time: convertZoneTimeToUTC(values.reminderTime, user.timeZone),
        timeZone: user.timeZone,
      });

      setLoadingText("Done!");
      setUploadProgress(100);
    }

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
    <div className="relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <fieldset disabled={loading} className="space-y-3">
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
                        <SelectItem value={ReminderFrequency.DAILY}>
                          Daily
                        </SelectItem>
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

            <p className="text-xs text-muted-foreground leading-sm">
              Your time zone is set to {getIanafromEnumKey(user.timeZone)}. If
              that’s not right, you can change it in your profile.
            </p>

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
              <Button
                variant="outline"
                className="w-full"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader className="animate-spin" /> : "Save"}
              </Button>
            </div>
          </fieldset>
        </form>
      </Form>

      {loading && (
        <div className="absolute inset-0 gap-5 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-md">
          <p className="text-md font-bold">{loadingText}</p>
          <Progress value={uploadProgress} className="w-[50%]" />
        </div>
      )}
    </div>
  );
}
