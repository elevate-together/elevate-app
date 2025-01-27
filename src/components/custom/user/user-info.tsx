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
import { SignOut } from "../buttons/sign-out";
import { menu_items } from "@/lib/utils";

export default async function UserInfo() {
  const session = await auth();
  const { name, email, image } = { ...session?.user };
  // const userId = session?.user?.id;

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
            <DropdownMenuItem className="hover:bg-transparent rounded-md p-0">
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
