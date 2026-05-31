import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Icon
					sf={{ default: "house", selected: "house.fill" }}
					md="home"
				/>
				<NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="discover">
				<NativeTabs.Trigger.Icon
					sf={{ default: "safari", selected: "safari.fill" }}
					md="explore"
				/>
				<NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="watchlist">
				<NativeTabs.Trigger.Icon
					sf={{ default: "bookmark", selected: "bookmark.fill" }}
					md="bookmark"
				/>
				<NativeTabs.Trigger.Label>Watchlist</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="profile">
				<NativeTabs.Trigger.Icon
					sf={{ default: "person", selected: "person.fill" }}
					md="person"
				/>
				<NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="search" role="search">
				<NativeTabs.Trigger.Icon
					sf="magnifyingglass"
					md="search"
				/>
				<NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
