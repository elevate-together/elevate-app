"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { updatePrayerGroupOwner } from "@/services/prayer-group";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { MinimalUser } from "@/lib/utils";
import UserAvatar from "@/components/custom/user/user-avatar";
import { PrayerGroup } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  newOwnerId: z.string().min(1, { message: "Please select a new owner" }),
});

type PrayerGroupOwnerFormProps = {
  prayerGroup: PrayerGroup;
  members: MinimalUser[];
  onSubmit: () => void;
  onCancel: () => void;
};

export default function PrayerGroupOwnerForm({
  prayerGroup,
  members,
  onSubmit,
  onCancel,
}: PrayerGroupOwnerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newOwnerId: prayerGroup.ownerId,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    if (values.newOwnerId !== prayerGroup.ownerId) {
      const result = await updatePrayerGroupOwner(
        prayerGroup.id,
        values.newOwnerId
      );

      if (result.success) {
        router.refresh();
        onSubmit();
      } else {
        toast.error(result.message || "Failed to update owner.");
      }
    } else {
      onSubmit();
    }

    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newOwnerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select New Owner for {prayerGroup.name}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="min-h-[60px] text-left">
                    <SelectValue placeholder="Select new owner" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] overflow-auto">
                    {members.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        className="min-h-[55px] text-left"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={user}
                            size="small"
                            boldName
                            includeEmail
                          />
                          {user.id === prayerGroup.ownerId && (
                            <Badge variant="outline">Current</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-xs text-muted-foreground leading-sm mb-2">
          Ownership changes are permanent and cannot be undone unless the new
          owner makes further changes.
        </p>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? <Loader className="animate-spin h-4 w-4" /> : "Confirm"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
