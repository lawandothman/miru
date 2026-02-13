import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
	name: string;
	image: string | null;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
}

const sizeClasses = {
	lg: "size-14",
	md: "size-10",
	sm: "size-8",
	xl: "size-20",
};

const textSizes = {
	lg: "text-lg",
	md: "text-sm",
	sm: "text-xs",
	xl: "text-2xl",
};

export function UserAvatar({
	name,
	image,
	size = "md",
	className,
}: UserAvatarProps) {
	return (
		<Avatar className={cn(sizeClasses[size], className)}>
			{image && <AvatarImage src={image} alt={name} />}
			<AvatarFallback
				className={cn(textSizes[size], "bg-primary/10 text-primary")}
			>
				{name.charAt(0).toUpperCase()}
			</AvatarFallback>
		</Avatar>
	);
}
