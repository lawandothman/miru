import { Stack } from "expo-router";
import { useDefaultHeaderOptions } from "@/lib/navigation";

export default function SearchLayout() {
	const headerOptions = useDefaultHeaderOptions();

	return <Stack screenOptions={headerOptions} />;
}
