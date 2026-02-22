import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";
import { API_URL } from "@/lib/api-url";
import { authClient } from "@/lib/auth";
import { Colors } from "@/lib/constants";
import { UserAvatar } from "./user-avatar";

interface AvatarUploadProps {
	imageUrl: string | null | undefined;
	name: string | null | undefined;
	size?: number;
}

export function AvatarUpload({ imageUrl, name, size = 64 }: AvatarUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUri, setPreviewUri] = useState<string | null>(null);

	async function handlePress() {
		if (isUploading) {
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (result.canceled || !result.assets[0]) {
			return;
		}

		const [asset] = result.assets;
		setPreviewUri(asset.uri);
		setIsUploading(true);

		try {
			const { uri } = asset;
			const filename = uri.split("/").pop() ?? "avatar.jpg";
			const match = /\.(\w+)$/.exec(filename);
			const ext = match?.[1] ?? "jpg";
			const mimeType =
				ext === "png"
					? "image/png"
					: ext === "webp"
						? "image/webp"
						: ext === "gif"
							? "image/gif"
							: "image/jpeg";

			const formData = new FormData();
			formData.append("file", {
				uri,
				name: filename,
				type: mimeType,
			} as unknown as Blob);

			const cookies = authClient.getCookie();
			const res = await fetch(`${API_URL}/api/upload-avatar`, {
				method: "POST",
				body: formData,
				headers: cookies ? { Cookie: cookies } : undefined,
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Upload failed");
			}

			const { url } = await res.json();
			await authClient.updateUser({ image: url });
			Alert.alert("Photo updated");
		} catch (err) {
			setPreviewUri(null);
			Alert.alert(
				"Error",
				err instanceof Error ? err.message : "Failed to upload photo",
			);
		} finally {
			setIsUploading(false);
		}
	}

	return (
		<Pressable
			onPress={handlePress}
			style={({ pressed }) => [styles.container, pressed && styles.pressed]}
			accessibilityLabel="Change profile photo"
			accessibilityRole="button"
		>
			<UserAvatar imageUrl={previewUri ?? imageUrl} name={name} size={size} />
			{isUploading ? (
				<ActivityIndicator
					size="small"
					color={Colors.foreground}
					style={[styles.overlay, { borderRadius: size / 2 }]}
				/>
			) : (
				<Camera
					size={size * 0.3}
					color="white"
					style={[styles.overlay, { borderRadius: size / 2 }]}
				/>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "relative",
	},
	pressed: {
		opacity: 0.7,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		alignItems: "center",
	},
});
