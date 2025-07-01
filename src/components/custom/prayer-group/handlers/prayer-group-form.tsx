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
import { useRef, useState } from "react";
import { ImageUp, Loader, X } from "lucide-react";
import { deleteGroupImage, uploadGroupImage } from "@/services/image";
import RoundedImage from "@/components/ui/rounded-image";
import { DEFAULT_IMAGE_URL } from "@/lib/utils";

const MAX_FILE_SIZE = 1_000_000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const formSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be left blank" }),
  description: z
    .string()
    .max(250, { message: "Description must be less than 250 characters" })
    .optional(),
  groupType: z.enum([GroupType.PUBLIC, GroupType.PRIVATE]),
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size > 0, "File cannot be empty")
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Max file size is ${MAX_FILE_SIZE / 1_000_000}MB`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, and .png formats are supported"
    ),
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
      groupType: group?.groupType || GroupType.PUBLIC,
      image: undefined,
    },
  });

  const router = useRouter();
  const isPublic = form.watch("groupType") === GroupType.PUBLIC;
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    form.setValue("image", undefined);
    setPreviewUrl(null);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      let result;
      let imageResult;

      if (group && group.id) {
        if (group.imageUrl) {
          await deleteGroupImage(group.imageUrl);
        }

        if (values.image) {
          imageResult = await uploadGroupImage(group.id, values.image);
          if (!imageResult.success) {
            toast.error(imageResult.message || "Image upload failed.");
            return;
          }
        }

        result = await updatePrayerGroup({
          id: group.id,
          groupData: {
            name: values.name,
            description: values.description,
            imageUrl: imageResult?.url,
          },
        });
      } else {
        result = await createPrayerGroup({
          name: values.name,
          ownerId,
          groupType: values.groupType,
          description: values.description,
        });

        if (result.success && result.prayerGroup) {
          if (values.image) {
            imageResult = await uploadGroupImage(
              result.prayerGroup.id,
              values.image
            );

            if (!imageResult.success) {
              toast.error(imageResult.message || "Image upload failed.");
              return;
            }

            result = await updatePrayerGroup({
              id: result.prayerGroup.id,
              groupData: { imageUrl: imageResult.url },
            });
          }
        }
      }

      if (result && result.success && result.prayerGroup) {
        router.refresh();
        onSubmit();
      } else {
        toast.error(result?.message || "An error occurred.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
      console.error(error);
    } finally {
      setLoading(false);
      form.reset();
    }
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
                You cannot change the group type after it’s created.
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
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>
                    {group ? "Upload New Group Image" : "Upload Image"}
                  </FormLabel>
                  <FormControl>
                    <div>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                        onChange={handleImageChange}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => inputRef.current?.click()}
                      >
                        <ImageUp className="w-4 h-4 mr-2" />
                        {previewUrl ? "Upload New Image" : "Upload Group Image"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground leading-sm">
              Help members recognize your group. Supported image formats: PNG,
              JPG, JPEG. For best results, use a 1:1 aspect ratio.
            </p>

            {group ? (
              <div>
                <div className="p-4 flex justify-center gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-muted-foreground leading-sm">
                      Current Image {group.imageUrl === null && "(default)"}
                    </div>
                    <RoundedImage
                      src={group.imageUrl ?? DEFAULT_IMAGE_URL}
                      alt={group.name || "Prayer Group Image"}
                      className="min-w-32 md:min-w-40"
                    />
                  </div>

                  {previewUrl && (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-muted-foreground leading-sm">
                        New Image
                      </div>
                      <div className="relative rounded-md border max-w-32 md:min-w-40 aspect-square overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Image preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {previewUrl && (
                  <div className="flex justify-center w-full">
                    <Button variant="destructive" onClick={handleRemoveImage}>
                      <X /> Remove Image
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center w-full">
                {previewUrl && (
                  <div className="relative rounded-md border max-w-32 md:min-w-40 aspect-square overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Image preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      onClick={handleRemoveImage}
                      className="w-full"
                    >
                      <X /> Remove Image
                    </Button>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="w-full min-h-[200px]"
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
