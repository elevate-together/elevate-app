"use client";

import { upload } from "@vercel/blob/client";
import {
  Input,
  Textarea,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RoundedImage,
  Progress,
} from "@/components/ui";
import { createPrayerGroup, updatePrayerGroup } from "@/services/prayer-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupType, type PrayerGroup } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRef, useState } from "react";
import { ImageUp, Loader, X } from "lucide-react";
import { deleteImage } from "@/services/image";
import { DEFAULT_IMAGE_URL } from "@/lib/utils";

const MAX_FILE_SIZE = 8_000_000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
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
      "Only .jpeg and .png formats are supported"
    ),
});

type PrayerGroupFormProps = {
  ownerId: string;
  onSubmit: () => void;
  onCancel: () => void;
  group?: PrayerGroup;
};

export function PrayerGroupForm({
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState("Saving Changes...");

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
    setLoadingText("Saving Changes...");
    try {
      let result;

      if (group && group.id) {
        if (values.image && group.imageUrl) {
          setLoadingText("Removing old group photo...");
          setUploadProgress(30);
          result = await deleteImage(group.imageUrl);
          if (!result.success) {
            toast.error("Error removing old group photo");
          }
        }

        const file = values.image;
        let newBlob;
        if (file) {
          setLoadingText("Uploading new group photo...");
          setUploadProgress(60);
          const extension = file.name.split(".").pop() ?? "png";
          newBlob = await upload(`group/${group.id}.${extension}`, file, {
            access: "public",
            handleUploadUrl: "/api/image/upload",
          });
          setPreviewUrl(newBlob.url);
        }

        setLoadingText("Updating group information...");
        setUploadProgress(90);
        result = await updatePrayerGroup({
          id: group.id,
          groupData: {
            name: values.name,
            description: values.description,
            imageUrl: newBlob?.url,
          },
        });
        setLoadingText("Done!");
        setUploadProgress(100);
      } else {
        setLoadingText("Creating group...");
        setUploadProgress(30);
        result = await createPrayerGroup({
          name: values.name,
          ownerId,
          groupType: values.groupType,
          description: values.description,
        });

        if (result.success && result.prayerGroup) {
          const file = values.image;
          const groupId = result.prayerGroup.id;
          let newBlob;
          if (file) {
            setLoadingText("Uploading group photo...");
            setUploadProgress(60);
            try {
              const extension = file.name.split(".").pop() ?? "png";
              newBlob = await upload(`group/${groupId}.${extension}`, file, {
                access: "public",
                handleUploadUrl: "/api/image/upload",
              });
            } catch {
              toast.error("Image upload failed. Please try again.");
            }
          }
          if (newBlob) {
            setLoadingText("Finalizing details..");
            setUploadProgress(90);
            await updatePrayerGroup({
              id: groupId,
              groupData: {
                imageUrl: newBlob.url,
              },
            });
          }
          setLoadingText("Done!");
          setUploadProgress(100);
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
      setUploadProgress(0);
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
    <div className="relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <fieldset disabled={loading} className="space-y-3">
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
                          accept="image/png, image/jpeg"
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
                          {previewUrl
                            ? "Upload New Image"
                            : "Upload Group Image"}
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
                        priority
                      />
                    </div>

                    {previewUrl && (
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground leading-sm">
                          New Image
                        </div>
                        <div className="relative rounded-md border min-w-32 max-w-32 md:min-w-40 md:max-w-40 aspect-square overflow-hidden"></div>
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
                    <div className="relative rounded-md border min-w-32 max-w-32 md:min-w-40 md:max-w-40 aspect-square overflow-hidden">
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
                  type="button"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <Loader className="spinner animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
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
