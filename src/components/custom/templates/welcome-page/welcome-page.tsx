"use client";

import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import SignIn from "../../user/user-sign-in";
import { useIsMobile } from "@/components/hooks/use-mobile";
import { UserRoundPlus } from "lucide-react";

export default function WelcomePage() {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col md:flex-row pl-5 items-center justify-center gap-8 md:gap-10 h-[90vh] md:justify-evenly">
      <div className="max-w-[400px] md:max-w-full px-9 flex flex-col flex-center">
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
          {/* <Collapsible>
            <CollapsibleTrigger asChild className="max-w-[200px] m-auto">
              <Button variant="ghost">
                <ChevronDown />
                Learn More
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              Yes. Free to use for personal and commercial projects. No
              attribution required.
            </CollapsibleContent>
          </Collapsible> */}
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
