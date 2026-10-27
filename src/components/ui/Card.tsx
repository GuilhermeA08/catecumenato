import type * as React from "react";
import { cn } from "../../utils/cn";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
	return (
		<div
			className={cn("rounded-[14px] bg-surface shadow-card", className)}
			{...props}
		/>
	);
}

interface CardHeaderProps extends Omit<DivProps, "title"> {
	title: React.ReactNode;
	description?: React.ReactNode;
	actions?: React.ReactNode;
}

export function CardHeader({
	className,
	title,
	description,
	actions,
	...props
}: CardHeaderProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-3 sm:px-6",
				className,
			)}
			{...props}
		>
			<div className="min-w-0">
				<h2 className="font-serif text-xl leading-tight font-medium">{title}</h2>
				{description && (
					<p className="mt-1 text-[13px] text-muted">{description}</p>
				)}
			</div>
			{actions && (
				<div className="flex flex-wrap items-center gap-2">{actions}</div>
			)}
		</div>
	);
}

export function CardContent({ className, ...props }: DivProps) {
	return <div className={cn("px-5 pb-5 sm:px-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-3 border-t border-line px-5 py-3 text-[13px] text-muted sm:px-6",
				className,
			)}
			{...props}
		/>
	);
}
