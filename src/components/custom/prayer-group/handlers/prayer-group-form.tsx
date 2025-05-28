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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPrayerGroup, updatePrayerGroup } from "@/services/prayer-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupType, type PrayerGroup } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";
import { Loader } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be left blank" }),
  description: z
    .string()
    .max(250, { message: "Description must be less than 250 characters" })
    .optional(),
  groupType: z.enum([GroupType.PUBLIC, GroupType.PRIVATE]),
});

type PrayerGroupFormProps = {
  ownerId: string;
  onSubmit: () => void;
  onCancel: () => void;
  group?: PrayerGroup;
};

export default function PrayerGroupForm({
  ownerId,
  onSubmit,
  group,
  onCancel,
}: PrayerGroupFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
      groupType: group?.groupType || GroupType.PUBLIC,
    },
  });

  const isPublic = form.watch("groupType") === GroupType.PUBLIC;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    let result;
    setLoading(true);

    if (group?.id) {
      result = await updatePrayerGroup({ id: group.id, groupData: values });
    } else {
      result = await createPrayerGroup({
        ...values,
        ownerId,
      });
    }

    if (result.success && result.prayerGroup) {
      router.refresh();
      onSubmit();
    } else {
      toast.error(result.message || "An error occurred.");
    }
    setLoading(false);
    form.reset();
  };

  const handleCancel = () => {
    form.reset({
      name: group?.name || "",
      description: group?.description || "",
      groupType: group?.groupType || GroupType.PUBLIC,
    });
    onCancel();
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-[2]">
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full bg-transparent"
                        placeholder="Exodus '25 Group"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!group?.name && (
                <FormField
                  control={form.control}
                  name="groupType"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Group Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(GroupType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0) + type.slice(1).toLowerCase()}
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
            </div>
            {group?.name ? (
              <p className="text-xs text-muted-foreground leading-sm">
                You cannot change the group type after it’s created.{" "}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground leading-sm">
                {isPublic
                  ? "This is a public group—anyone can join without approval. Prayer requests shared here are visible to all members. Note: You won't be able to change the group type after creating it."
                  : "This is a private group—new members must be approved to join. This helps protect the privacy of any prayer requests shared within the group. Note: You won't be able to change the group type after creating it."}
              </p>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="w-full min-h-64 md:min-h-32"
                      placeholder="Description (optional)"
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
                onClick={handleCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader className="spinner animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
