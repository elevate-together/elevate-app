"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { updateUser } from "@/services/user";
import { toast } from "sonner";
import { ZoneType, type User } from "@prisma/client";
import { getIanafromEnumKey, timezoneMap } from "@/lib/utils";
import { useRouter } from "next/navigation";

const allowedTimezones = Object.keys(timezoneMap);

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name cannot be left blank",
  }),
  email: z.string(),
  timeZone: z.enum(allowedTimezones as [string, ...string[]]),
});

type UserFormProps = {
  user: User;
  isEdit: boolean;
  onCancel?: () => void;
  onSubmit?: (user: User) => void;
};

export default function UserForm({
  user,
  isEdit,
  onCancel,
  onSubmit,
}: UserFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      timeZone: user.timeZone,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, timeZone } = values;
    const result = await updateUser({
      id: user.id,
      userData: { name, timeZone: timeZone as ZoneType },
    });

    if (result.success && result.user) {
      router.refresh();
      form.reset({
        name: user.name,
        timeZone: user.timeZone,
      });
      if (onSubmit) {
        onSubmit(result.user);
      }
    } else {
      toast.error(result.message || "An error occurred.");
    }

    form.reset();
  };

  const handleCancel = () => {
    form.reset({
      name: user.name,
      timeZone: user.timeZone,
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Name:
                    </FormLabel>
                    <FormControl>
                      <Input readOnly={!isEdit} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Email:
                    </FormLabel>
                    <FormControl>
                      <Input readOnly {...field} />
                    </FormControl>
                    {isEdit && (
                      <p className="text-xs text-muted-foreground leading-sm">
                        Email cannot be changed.
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Time Zone:
                    </FormLabel>
                    <FormControl>
                      {isEdit ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full bg-card">
                            <SelectValue placeholder="Select time zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {allowedTimezones.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {getIanafromEnumKey(tz as ZoneType)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          readOnly
                          value={getIanafromEnumKey(user.timeZone)}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            {isEdit && (
              <div className="flex flex-row gap-4 items-center justify-end">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
