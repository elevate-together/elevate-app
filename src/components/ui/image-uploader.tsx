"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageUp } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  image: z.any().refine((file) => file instanceof File || file === null, {
    message: "Please select a valid image",
  }),
});

export default function ImageUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: null,
    },
  });

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

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const file = values.image;
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    toast.success("Image ready for upload!");
    console.log("Selected file:", file);
  };

  const handleCancel = () => {
    form.reset();
    setPreviewUrl(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Upload Image</FormLabel>
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
                      onClick={() => inputRef.current?.click()}
                    >
                      <ImageUp className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {previewUrl && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Preview:</p>
              <Image
                src={previewUrl}
                alt="Image preview"
                className="rounded-md border max-h-48 object-cover"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
