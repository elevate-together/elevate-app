import React, { ReactNode } from "react";
import { Button, ButtonProps } from "@/components/ui";

export function SidebarButton({
  children,
  ...props
}: {
  children: ReactNode;
} & ButtonProps) {
  return (
    <Button variant="ghost" className="w-full justify-start" {...props}>
      {children}
    </Button>
  );
}

export function MenuDropdownButton({
  children,
  ...props
}: {
  children: ReactNode;
} & ButtonProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className="justify-start"
      {...props}
    >
      {children}
    </Button>
  );
}

export function IconButton({
  children,
  ...props
}: {
  children: ReactNode;
} & ButtonProps) {
  return (
    <Button size="icon" variant="ghost" {...props}>
      {children}
    </Button>
  );
}
export type ButtonHandlerVariant =
  | "normal"
  | "icon"
  | "largeIcon"
  | "menu"
  | "menuDropdown";
type ButtonHandlerProps = {
  variant?: ButtonHandlerVariant;
  icon: React.ElementType;
  title: string;
  onClick: () => void;
};

// className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent focus:outline-none focus:ring-0 focus-visible:ring-0 border-0"
export function ButtonHandler({
  icon: Icon,
  title,
  variant = "normal",
  onClick,
}: ButtonHandlerProps) {
  if (variant === "icon") {
    return (
      <IconButton onClick={onClick}>
        <Icon />
      </IconButton>
    );
  } else if (variant === "largeIcon") {
    return (
      <IconButton onClick={onClick} size="largeIcon">
        <Icon />
      </IconButton>
    );
  } else if (variant === "menu") {
    return (
      <SidebarButton onClick={onClick}>
        <Icon />
        {title}
      </SidebarButton>
    );
  } else if (variant === "menuDropdown") {
    return (
      <MenuDropdownButton onClick={onClick}>
        <Icon />
        {title}
      </MenuDropdownButton>
    );
  } else if (variant === "normal") {
    return (
      <Button onClick={onClick} variant="outline">
        <Icon />
        {title}
      </Button>
    );
  }
}
