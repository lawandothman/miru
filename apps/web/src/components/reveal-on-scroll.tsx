"use client";

import { useEffect, useRef, useState } from "react";

interface RevealOnScrollProps {
	children: React.ReactNode;
	direction?: "up" | "left" | "right";
	delay?: number;
	className?: string;
}

export function RevealOnScroll({
	children,
	direction = "up",
	delay = 0,
	className,
}: RevealOnScrollProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
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
	}, []);

	const transforms = {
		left: "translateX(-32px)",
		right: "translateX(32px)",
		up: "translateY(32px)",
	};

	return (
		<div
			ref={ref}
			className={className}
			style={{
				opacity: visible ? 1 : 0,
				transform: visible ? "none" : transforms[direction],
				transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
			}}
		>
			{children}
		</div>
	);
}
