import { describe, it, expect } from "vitest";
import { lightColors, darkColors } from "../colors";
import { spacing } from "../spacing";
import { radius } from "../radius";
import {
	fontFamily,
	mobileFontFamily,
	fontSize,
	lineHeight,
	fontWeight,
} from "../typography";

describe("color tokens", () => {
	it("light and dark themes have the same keys", () => {
		const lightKeys = Object.keys(lightColors).sort();
		const darkKeys = Object.keys(darkColors).sort();
		expect(lightKeys).toEqual(darkKeys);
	});

	it("all color values are non-empty strings", () => {
		for (const [key, value] of Object.entries(lightColors)) {
			expect(value, `lightColors.${key}`).toBeTruthy();
			expect(typeof value).toBe("string");
		}
		for (const [key, value] of Object.entries(darkColors)) {
			expect(value, `darkColors.${key}`).toBeTruthy();
			expect(typeof value).toBe("string");
		}
	});

	it("has expected core tokens", () => {
		const requiredTokens = [
			"background",
			"foreground",
			"primary",
			"primaryForeground",
			"secondary",
			"muted",
			"mutedForeground",
			"destructive",
			"border",
		];

		for (const token of requiredTokens) {
			expect(lightColors).toHaveProperty(token);
			expect(darkColors).toHaveProperty(token);
		}
	});
});

describe("spacing tokens", () => {
	it("follows a consistent 4px base grid", () => {
		expect(spacing[1]).toBe(4);
		expect(spacing[2]).toBe(8);
		expect(spacing[4]).toBe(16);
		expect(spacing[8]).toBe(32);
	});

	it("has zero spacing", () => {
		expect(spacing[0]).toBe(0);
	});

	it("has half-step values", () => {
		expect(spacing[0.5]).toBe(2);
		expect(spacing[1.5]).toBe(6);
		expect(spacing[2.5]).toBe(10);
	});

	it("all values are non-negative numbers", () => {
		for (const [key, value] of Object.entries(spacing)) {
			expect(value, `spacing[${key}]`).toBeGreaterThanOrEqual(0);
			expect(typeof value).toBe("number");
		}
	});
});

describe("radius tokens", () => {
	it("increases monotonically", () => {
		expect(radius.sm).toBeLessThan(radius.md);
		expect(radius.md).toBeLessThan(radius.lg);
		expect(radius.lg).toBeLessThan(radius.xl);
		expect(radius.xl).toBeLessThan(radius["2xl"]);
	});

	it("has a full radius for pills/circles", () => {
		expect(radius.full).toBe(9999);
	});

	it("base (lg) is 10px", () => {
		expect(radius.lg).toBe(10);
	});
});

describe("typography tokens", () => {
	it("font families include sans and display", () => {
		expect(fontFamily.sans).toBe("DM Sans");
		expect(fontFamily.display).toBe("Syne");
	});

	it("mobile font families map to expo-google-fonts names", () => {
		expect(mobileFontFamily.sans).toBe("DMSans_400Regular");
		expect(mobileFontFamily.sansMedium).toBe("DMSans_500Medium");
		expect(mobileFontFamily.sansSemibold).toBe("DMSans_600SemiBold");
		expect(mobileFontFamily.sansBold).toBe("DMSans_700Bold");
		expect(mobileFontFamily.display).toBe("Syne_400Regular");
		expect(mobileFontFamily.displaySemibold).toBe("Syne_600SemiBold");
		expect(mobileFontFamily.displayBold).toBe("Syne_700Bold");
	});

	it("font sizes increase monotonically", () => {
		const sizes = [
			fontSize.xs,
			fontSize.sm,
			fontSize.base,
			fontSize.lg,
			fontSize.xl,
			fontSize["2xl"],
			fontSize["3xl"],
			fontSize["4xl"],
			fontSize["5xl"],
		];

		for (let i = 1; i < sizes.length; i += 1) {
			const prev = sizes[i - 1];
			expect(sizes[i], `fontSize[${i}]`).toBeGreaterThan(prev ?? 0);
		}
	});

	it("line heights are >= font sizes", () => {
		const keys = Object.keys(fontSize) as (keyof typeof fontSize)[];
		for (const key of keys) {
			expect(
				lineHeight[key],
				`lineHeight.${key} >= fontSize.${key}`,
			).toBeGreaterThanOrEqual(fontSize[key]);
		}
	});

	it("font weights are valid CSS weight strings", () => {
		const validWeights = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
		for (const [key, value] of Object.entries(fontWeight)) {
			expect(validWeights, `fontWeight.${key}`).toContain(value);
		}
	});
});
