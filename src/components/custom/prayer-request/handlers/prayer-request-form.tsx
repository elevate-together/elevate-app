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
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import {
  createPrayerRequest,
  updatePrayerRequest,
} from "@/services/prayer-request";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PrayerRequestStatus,
  PrayerVisibility,
  type PrayerRequest,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { BellOff, BellRing, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { getPrayerGroupsForUser } from "@/services/user-prayer-group";
import { getSharedGroupIds } from "@/services/prayer-request-share";
import SessionNotFound from "@/components/not-found/session";
import { ShareWithTypes } from "@/lib/utils";

const formSchema = z.object({
  request: z.string().min(1, { message: "Request cannot be left blank" }),
  sharedWith: z
    .array(z.string().min(1))
    .min(1, "Please select who you want to share it with"),
  notify: z.boolean(),
});

type PrayerRequestFormProps = {
  prayer?: PrayerRequest;
  onCancel?: () => void;
  onSubmit?: () => void;
  isOpen?: boolean;
  userId: string;
  defaultGroupId?: string; // only for create
};

type ShareWithTypeLabel = {
  value: string;
  label: string;
  type: ShareWithTypes;
};

export default function PrayerRequestForm({
  onSubmit,
  prayer,
  onCancel,
  isOpen = false,
  userId,
  defaultGroupId = "",
}: PrayerRequestFormProps) {
  const router = useRouter();

  const [options, setOptions] = useState<ShareWithTypeLabel[]>([]);

  const [loadingPane, setLoadingPane] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: prayer?.request || "",
      sharedWith: [],
      notify: true,
    },
  });

  const isNotify = form.watch("notify");

  useEffect(() => {
    async function fetchData() {
      setLoadingPane(true);
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (!session?.user?.id) return <SessionNotFound />;

      const constants: ShareWithTypeLabel[] = [
        { value: "1", label: "Everyone", type: "public" },
        { value: "2", label: "Just Myself", type: "private" },
      ];

      const { prayerGroups } = await getPrayerGroupsForUser(session.user.id);
      const formattedGroups: ShareWithTypeLabel[] = (prayerGroups || []).map(
        (group) => ({
          value: group.id,
          label: group.name,
          type: "group",
        })
      );

      setOptions([...constants, ...formattedGroups]);

      if (prayer?.id) {
        if (prayer.visibility === PrayerVisibility.PUBLIC) {
          setSelectedValues(["1"]);
          form.setValue("sharedWith", ["1"]);
        } else if (prayer.visibility === PrayerVisibility.PRIVATE) {
          setSelectedValues(["2"]);
          form.setValue("sharedWith", ["2"]);
        } else {
          const { sharedWith } = await getSharedGroupIds(session.user.id);
          setSelectedValues(sharedWith || []);
          form.setValue("sharedWith", sharedWith || []);
        }
      } else {
        if (defaultGroupId !== "") {
          setSelectedValues([defaultGroupId]);
          form.setValue("sharedWith", [defaultGroupId]);
        } else {
          setSelectedValues(["1"]);
          form.setValue("sharedWith", ["1"]);
        }
      }
      setLoadingPane(false);
    }

    fetchData();
  }, [prayer, form, defaultGroupId]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoadingSubmit(true);
    const { request, notify, sharedWith } = values;
    const sharedWithWithType = sharedWith
      .map((id) => {
        const match = options.find((option) => option.value === id);
        return match ? { id: match.value, type: match.type } : null;
      })
      .filter(
        (item): item is { id: string; type: ShareWithTypes } => item !== null
      );

    let result;
    if (prayer?.id) {
      const requestData = {
        request,
        status: PrayerRequestStatus.IN_PROGRESS,
        sharedWith: sharedWithWithType,
      };
      result = await updatePrayerRequest({
        id: prayer.id,
        requestData,
        userId,
      });
    } else {
      result = await createPrayerRequest({
        request,
        notify,
        sharedWith: sharedWithWithType,
        userId,
      });
    }

    if (result.success && result?.prayerRequest) {
      router.refresh();
      onSubmit?.();
    } else {
      toast.error(result.message);
    }
    resetForm();
    setLoadingSubmit(false);
  };

  const resetForm = () => {
    form.reset({
      request: prayer?.request || "",
      notify: true,
      sharedWith: selectedValues,
    });
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col justify-center gap-2">
              <p className="text-sm">Share With</p>
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
                          selectedValues={selectedValues}
                          setSelectedValues={setSelectedValues}
                          specialSelection
                          placeholder="Request PrayerVisibility"
                          modalPopover={true}
                          isParentOpen={isOpen}
                          maxCount={3}
                          loading={loadingPane}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!prayer?.id && (
                  <FormField
                    control={form.control}
                    name="notify"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Toggle
                            pressed={field.value}
                            onPressedChange={field.onChange}
                            aria-label="Toggle notify"
                            className="hover:bg-transparent active:bg-transparent focus:bg-transparent focus-visible:bg-transparent data-[state=on]:bg-transparent"
                          >
                            {field.value ? (
                              <BellRing className="h-4 w-4" />
                            ) : (
                              <BellOff className="h-4 w-4" />
                            )}
                          </Toggle>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-sm">
                Everyone selected will have access to this request—you can
                update it anytime.
                {isNotify
                  ? " Notifications will be sent to all selected recipients. Toggle to disable."
                  : " Notifications are disabled. Toggle to enable and notify selected recipients of your request."}
              </p>
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
                disabled={loadingSubmit}
              >
                Cancel
              </Button>
              <Button className="w-full" type="submit" disabled={loadingSubmit}>
                {loadingSubmit ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
