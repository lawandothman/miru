"use client";

import { useEffect, useRef, useState } from "react";

interface RevealOnScrollProps {
	children: React.ReactNode;
	direction?: "up" | "left" | "right";
	delay?: number;
	className?: string;
}

function prefersReducedMotion(): boolean {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

export function RevealOnScroll({
	children,
	direction = "up",
	delay = 0,
	className,
}: RevealOnScrollProps) {
	const ref = useRef<HTMLDivElement>(null);
	const reducedMotion = prefersReducedMotion();
	const [visible, setVisible] = useState(reducedMotion);

	useEffect(() => {
		if (reducedMotion) {
			return;
		}

		const el = ref.current;
		if (!el) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.15 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [reducedMotion]);

	const transforms = {
		left: "translateX(-32px)",
		right: "translateX(32px)",
		up: "translateY(32px)",
	};

	return (
		<div
			ref={ref}
			className={className}
			style={
				reducedMotion
					? undefined
					: {
							opacity: visible ? 1 : 0,
							transform: visible ? "none" : transforms[direction],
							transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
						}
			}
		>
			{children}
		</div>
	);
}
