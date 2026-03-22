import { Stack } from "expo-router";
import { defaultHeaderOptions } from "@/lib/navigation";

export default function SearchLayout() {
	return <Stack screenOptions={defaultHeaderOptions} />;
}
