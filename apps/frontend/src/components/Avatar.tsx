import * as Avatar from "@radix-ui/react-avatar";
import type { User } from "next-auth";

const initials = (name: string) => {
  const [firstName, lastName] = name.split(" ");
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName?.charAt(0);
};

export const ProfilePicture = ({ user }: { user: User }) => {
  return (
    <Avatar.Root className="inline-flex h-6 w-6 select-none items-center justify-center overflow-hidden rounded-full align-middle">
      {user.image && (
        <Avatar.Image
          className="h-full w-full border-inherit object-cover"
          src={user.image ?? ""}
          alt={user.name ?? ""}
        />
      )}
      <Avatar.Fallback
        className="flex h-full w-full items-center bg-white text-sm text-neutral-900 "
        delayMs={600}
      >
        {user.name && initials(user.name)}
      </Avatar.Fallback>
    </Avatar.Root>
  );
};
