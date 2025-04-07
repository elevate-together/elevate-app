import SignIn from "@/components/custom/user/user-sign-in";
import SignOut from "@/components/custom/user/user-sign-out";

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

type UserInfoProps = {
  id: string | undefined;
  name: string;
  email: string;
  image: string;
};
export default function UserInfo({ id, name, email, image }: UserInfoProps) {
  return (
    <div className="flex items-center">
      {name != "" && email != "" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-2 my-3 rounded-lg w-full hover:bg-accent">
              <UserAvatar
                name={name}
                email={email}
                image={image}
                icon
                includeEmail
              />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent sideOffset={7} className="p-2">
            <DropdownMenuLabel>
              <div>
                <UserAvatar
                  name={name}
                  email={email}
                  image={image}
                  includeEmail
                />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 " />
            <DropdownMenuItem disabled>Quick Actions</DropdownMenuItem>
            {menu_items.map((item) => {
              const url = item.url.replace("{id}", id || "");

              return (
                <span key={item.title}>
                  {item.auth ? (
                    id ? (
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
