import { NativeTabs, NativeTabTrigger, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabTrigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabTrigger>
      <NativeTabTrigger name="discover">
        <Icon sf={{ default: "safari", selected: "safari.fill" }} />
        <Label>Discover</Label>
      </NativeTabTrigger>
      <NativeTabTrigger name="watchlist">
        <Icon sf={{ default: "bookmark", selected: "bookmark.fill" }} />
        <Label>Watchlist</Label>
      </NativeTabTrigger>
      <NativeTabTrigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabTrigger>
    </NativeTabs>
  );
}
