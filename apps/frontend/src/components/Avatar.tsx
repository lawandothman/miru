import * as Avatar from "@radix-ui/react-avatar";
import type { User } from "next-auth";
import type { FC } from "react";
import { cn } from "utils/cn";

const initials = (name: string) => {
  const [firstName, lastName] = name.split(" ");
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName?.charAt(0);
};

interface ProfilePictureProps {
  user: User;
  size: "sm" | "md" | "lg";
}

export const ProfilePicture: FC<ProfilePictureProps> = ({
  user,
  size = "sm",
}) => {
  return (
    <Avatar.Root
      className={cn(
        "inline-flex  select-none items-center justify-center overflow-hidden rounded-full align-middle",
        size === "md" ? "h-10 w-10" : size == "lg" ? "h-14 w-14" : "h-6 w-6"
      )}
    >
      {user.image && (
        <Avatar.Image
          className="h-full w-full border-inherit object-cover"
          src={user.image ?? ""}
          alt={user.name ?? ""}
        />
      )}
      <Avatar.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center bg-white text-sm text-neutral-900",
          size === "md" ? "text-lg" : size === "lg" ? "text-3xl" : "text-base"
        )}
        delayMs={600}
      >
        {user.name && initials(user.name)}
      </Avatar.Fallback>
    </Avatar.Root>
  );
};
