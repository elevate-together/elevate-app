"use client";

import Image from "next/image";
import { UserRoundPlus } from "lucide-react";
import { useIsMobile } from "@/components/hooks";
import { Separator } from "@/components/ui";
import { SignIn } from "@/components/data-handlers";

export function WelcomePageTemplate() {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col md:flex-row  items-center justify-end pb-9 md:pb-0 gap-8 md:gap-10 h-[90vh] md:justify-evenly ml-5">
      <div className="max-w-[353px] px-6 md:max-w-full md:mx-9 flex flex-col flex-center">
        <div className="flex flexp-col items-center gap-1">
          <Image
            src="/icon.png"
            alt="Elevate Logo"
            width={isMobile ? "50" : "90"}
            height={isMobile ? "50" : "90"}
          />
          <h1 className="text-4xl md:text-6xl font-bold">Elevate</h1>
        </div>
        <div className="flex flex-col max-w-[500px] items-center">
          <p className="text-sm md:text-base text-muted-foreground">
            Here to strengthen community through meaningful prayer, with tools
            that help us support and uplift each other, fostering growth and
            connection.
          </p>
        </div>
      </div>

      {isMobile ? (
        <div className="w-[70vw]">
          <Separator orientation="horizontal" />
        </div>
      ) : (
        <div className="h-[60vh]">
          <Separator orientation="vertical" />
        </div>
      )}

      <div className="flex flex-col gap-3 px-6 max-w-[500px]">
        <div>
          <h2 className="text-xl font-semibold">Get Started with Elevate</h2>
          <p className="text-muted-foreground text-sm">
            Connect your google account to get started today
          </p>
        </div>
        <SignIn>
          <UserRoundPlus />
          Sign Up
        </SignIn>
        <Separator className="my-3" />
        <p className="text-muted-foreground text-sm">
          Already Have an account?
        </p>
        <SignIn variant="secondary">Log In</SignIn>
      </div>
    </div>
  );
}
