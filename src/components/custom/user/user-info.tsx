import { auth } from "@/auth";
import { SignIn } from "@/components/custom/buttons/sign-in";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./user-avatar";
import { User, Home } from "lucide-react";
import { SignOut } from "../buttons/sign-out";
import Link from "next/link";

export default async function UserInfo() {
  const session = await auth();
  const { name, email, image } = { ...session?.user };
  return (
    <div className="flex items-center">
      {session && name && email && image ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-2 my-3 rounded-lg w-full hover:bg-gray-100">
              <UserAvatar name={name} email={email} image={image} icon />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            // side="top"
            sideOffset={7}
            // align="end"
            className="p-2"
          >
            <DropdownMenuLabel className="font-semibold text-gray-700">
              <div>
                <UserAvatar name={name} email={email} image={image} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 border-gray-200" />
            <Link href="/">
              <DropdownMenuItem className="bg-transparent hover:bg-transparent rounded-md p-0">
                <DropdownMenuLabel>
                  <Home width={17} />
                </DropdownMenuLabel>
                Home
              </DropdownMenuItem>
            </Link>
            <Link href="profile">
              <DropdownMenuItem className="hover:bg-gray-100 rounded-md p-0">
                <DropdownMenuLabel>
                  <User width={17} />
                </DropdownMenuLabel>
                Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="my-1 border-gray-200" />
            <DropdownMenuItem className="hover:bg-gray-100 rounded-md p-0">
              <SignOut />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="p-2 my-3 rounded-lg w-full">
          <SignIn />
        </div>
      )}
    </div>
  );
}
