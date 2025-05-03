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
import { Input } from "@/components/ui/input";
import { createUser, updateUser } from "@/services/user";
import { toast } from "sonner";
import type { User } from "@prisma/client";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name cannot be left blank",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

type UserFormProps = {
  onSubmit: (user: User) => void;
  user?: User;
  onCancel?: () => void;
};

export default function UserForm({ onSubmit, user, onCancel }: UserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, email } = values;
    let result;

    if (user?.id) {
      result = await updateUser(user.id, { name, email });
    } else {
      result = await createUser({ name, email });
    }

    if (result.success && result.user) {
      onSubmit(result.user);
    } else {
      toast.error(result.message || "An error occurred.");
    }

    form.reset();
  };

  const handleCancel = () => {
    form.reset({
      name: user?.name || "",
      email: user?.email || "",
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
            <div className="flex flex-row gap-8 items-end">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {user?.id ? (
              <div className="flex flex-row gap-4 items-center">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            ) : (
              <Button type="submit">Submit</Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
