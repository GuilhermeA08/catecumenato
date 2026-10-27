import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../utils/cn";

export const buttonVariants = cva(
	[
		"inline-flex shrink-0 items-center justify-center gap-2 rounded-[9px] font-medium whitespace-nowrap select-none",
		"transition-colors duration-150 cursor-pointer",
		"disabled:pointer-events-none disabled:opacity-50",
		"[&_svg]:size-4 [&_svg]:shrink-0",
	],
	{
		variants: {
			variant: {
				primary: "bg-accent text-white hover:bg-accent-hover",
				secondary:
					"bg-surface text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-sidebar",
				ghost: "text-ink-2 hover:bg-sand hover:text-ink",
				dark: "bg-ink text-bg hover:bg-ink-2",
				danger:
					"bg-surface text-danger-ink shadow-[inset_0_0_0_1px_rgb(179_38_30/0.35)] hover:bg-danger-soft",
				"danger-solid": "bg-danger text-white hover:bg-danger-ink",
			},
			size: {
				sm: "h-8 px-3 text-[13px]",
				md: "h-10 px-4 text-sm",
				lg: "h-11 px-5 text-[15px]",
				icon: "size-10",
				"icon-sm": "size-8",
			},
		},
		defaultVariants: { variant: "primary", size: "md" },
	},
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		ButtonVariantProps {
	loading?: boolean;
}

export function Button({
	className,
	variant,
	size,
	loading = false,
	disabled,
	type = "button",
	children,
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={cn(buttonVariants({ variant, size }), className)}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			{...props}
		>
			{loading && <Spinner />}
			{children}
		</button>
	);
}

export function Spinner({ className }: { className?: string }) {
	return (
		<svg
			className={cn("size-4 animate-spin", className)}
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="3"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
			/>
		</svg>
	);
}
