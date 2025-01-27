import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";

type AvatarProps = {
  name: string;
  email: string;
  image: string;
  icon?: boolean;
};

export default async function UserAvatar({
  name,
  email,
  image,
  icon = false,
}: AvatarProps) {
  return (
    <div
      className={`flex flex-row items-center ${
        icon ? "justify-between" : "justify-start gap-2"
      }`}
    >
      {image ? (
        <Avatar>
          <AvatarImage className="" src={image} />
          <AvatarFallback>{name?.at(0) ?? "A"}</AvatarFallback>
        </Avatar>
      ) : (
        <Avatar>
          <AvatarFallback>{name?.at(0) ?? "A"}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col gap-0 items-start">
        <div className="text-sm font-semibold p-0 m-0">{name}</div>
        <p className="text-xs font-normal text-muted-foreground p-0 m-0">
          {email}
        </p>
      </div>
      {icon && <EllipsisVertical width={17} />}
    </div>
  );
}
