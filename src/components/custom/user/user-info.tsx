import { auth } from "@/auth";
import SignIn from "@/components/custom/functions/sign-in";
import SignOut from "@/components/custom/functions/sign-out";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { menu_items } from "@/lib/utils";
import UserAvatar from "./user-avatar";

export default async function UserInfo() {
  const session = await auth();
  const { name, email, image } = { ...session?.user };

  return (
    <div className="flex items-center">
      {session && name && email && image ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-2 my-3 rounded-lg w-full hover:bg-accent">
              <UserAvatar name={name} email={email} image={image} icon />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent sideOffset={7} className="p-2">
            <DropdownMenuLabel>
              <div>
                <UserAvatar name={name} email={email} image={image} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 " />
            <DropdownMenuItem disabled>Quick Actions</DropdownMenuItem>
            {menu_items.map((item) => {
              const url = item.url.replace("{id}", session?.user?.id || "");

              return (
                <span key={item.title}>
                  {item.auth ? (
                    session?.user ? (
                      <a href={url}>
                        <DropdownMenuItem className="flex flex-row">
                          <item.icon width={16} />
                          <span>{item.title}</span>
                        </DropdownMenuItem>
                      </a>
                    ) : null
                  ) : (
                    <a href={item.url}>
                      <DropdownMenuItem className="flex flex-row">
                        <item.icon width={16} />
                        <span>{item.title}</span>
                      </DropdownMenuItem>
                    </a>
                  )}
                </span>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex justify-center hover:bg-transparent rounded-md p-0 bg-green-300">
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
