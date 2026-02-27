import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Icon
					sf={{ default: "house", selected: "house.fill" }}
				/>
				<NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="discover">
				<NativeTabs.Trigger.Icon
					sf={{ default: "safari", selected: "safari.fill" }}
				/>
				<NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="watchlist">
				<NativeTabs.Trigger.Icon
					sf={{ default: "bookmark", selected: "bookmark.fill" }}
				/>
				<NativeTabs.Trigger.Label>Watchlist</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="profile">
				<NativeTabs.Trigger.Icon
					sf={{ default: "person", selected: "person.fill" }}
				/>
				<NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
