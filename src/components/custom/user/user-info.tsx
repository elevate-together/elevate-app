import SignIn from "@/components/custom/user/buttons/user-sign-in";
import SignOut from "@/components/custom/user/buttons/user-sign-out";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { menu_items, UserBasics } from "@/lib/utils";
import UserAvatar from "@/components/custom/user/user-avatar";

type UserInfoProps = {
  user: UserBasics;
};
export default function UserInfo({ user }: UserInfoProps) {
  return (
    <div className="flex items-center">
      {user.name != "" && user.email != "" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-2 my-3 rounded-lg w-full hover:bg-accent">
              <UserAvatar user={user} icon includeEmail excludeLink />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent sideOffset={7} className="p-2">
            <DropdownMenuLabel>
              <UserAvatar user={user} includeEmail />
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 " />
            <DropdownMenuItem disabled>Quick Actions</DropdownMenuItem>
            {menu_items.map((item) => {
              const url = item.url.replace("{id}", user.id || "");

              return (
                <span key={item.title}>
                  {item.auth ? (
                    user.id ? (
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
