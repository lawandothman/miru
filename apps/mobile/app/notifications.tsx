import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { Bell } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
	RefreshControl,
	SectionList,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { EmptyState } from "@/components/empty-state";
import {
	NotificationItem,
	type NotificationItemData,
} from "@/components/notification-item";
import { Spinner } from "@/components/spinner";
import { Colors, fontFamily, fontSize, spacing } from "@/lib/constants";
import { triggerRefreshHaptic } from "@/lib/haptics";
import { useDefaultHeaderOptions } from "@/lib/navigation";
import { trpc } from "@/lib/trpc";

interface Section {
	title: string;
	data: NotificationItemData[];
}

function groupByTime(items: NotificationItemData[]): Section[] {
	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const weekStart = new Date(todayStart);
	weekStart.setDate(weekStart.getDate() - 7);
	const monthStart = new Date(todayStart);
	monthStart.setDate(monthStart.getDate() - 30);

	const groups: Record<string, NotificationItemData[]> = {
		Today: [],
		"This Week": [],
		"This Month": [],
		Earlier: [],
	};

	for (const item of items) {
		const created = item.createdAt;
		if (created >= todayStart) {
			groups.Today?.push(item);
		} else if (created >= weekStart) {
			groups["This Week"]?.push(item);
		} else if (created >= monthStart) {
			groups["This Month"]?.push(item);
		} else {
			groups.Earlier?.push(item);
		}
	}

	return Object.entries(groups)
		.filter(([, data]) => data.length > 0)
		.map(([title, data]) => ({ title, data }));
}

export default function NotificationsScreen() {
	const utils = trpc.useUtils();
	const [refreshing, setRefreshing] = useState(false);
	const headerOptions = useDefaultHeaderOptions();

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		trpc.notification.list.useInfiniteQuery(
			{},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			},
		);

	const { mutate: markAllAsRead } = trpc.notification.markAllAsRead.useMutation(
		{
			onSuccess: () => {
				utils.notification.getUnreadCount.invalidate();
			},
		},
	);

	useEffect(() => {
		markAllAsRead();
		Notifications.setBadgeCountAsync(0).catch(() => undefined);
	}, [markAllAsRead]);

	const sections = useMemo(() => {
		const allNotifications =
			data?.pages.flatMap((page) =>
				page.notifications.map((n) => ({
					...(n as unknown as NotificationItemData),
					createdAt: new Date(n.createdAt),
				})),
			) ?? [];
		return groupByTime(allNotifications);
	}, [data]);

	async function handleRefresh() {
		triggerRefreshHaptic();
		setRefreshing(true);
		try {
			await Promise.all([
				utils.notification.list.invalidate(),
				utils.notification.getUnreadCount.invalidate(),
			]);
			markAllAsRead();
		} finally {
			setRefreshing(false);
		}
	}

	function handleEndReached() {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}

	return (
		<>
			<Stack.Screen options={{ ...headerOptions, title: "Notifications" }} />
			<View style={styles.container}>
				<SectionList
					sections={sections}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => <NotificationItem item={item} />}
					renderSectionHeader={({ section }) => (
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>{section.title}</Text>
						</View>
					)}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={Colors.mutedForeground}
						/>
					}
					onEndReached={handleEndReached}
					onEndReachedThreshold={0.5}
					ListEmptyComponent={
						isLoading ? (
							<Spinner />
						) : (
							<EmptyState
								icon={Bell}
								title="No notifications"
								description="When someone follows you or matches your watchlist, it'll show up here."
							/>
						)
					}
					ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
					contentContainerStyle={styles.listContent}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	listContent: {
		flexGrow: 1,
	},
	sectionHeader: {
		paddingHorizontal: spacing[4],
		paddingTop: spacing[5],
		paddingBottom: spacing[2],
		backgroundColor: Colors.background,
	},
	sectionTitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
	},
});
