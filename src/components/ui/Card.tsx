import type * as React from "react";
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"rounded-xl border border-gray-200 bg-white shadow-sm",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
	return (
		<div className={cn("flex flex-col gap-1 p-5 sm:p-6", className)} {...props}>
			{children}
		</div>
	);
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
	return (
		<h3
			className={cn("text-base font-semibold text-gray-900", className)}
			{...props}
		>
			{children}
		</h3>
	);
}

export function CardContent({
	className,
	children,
	...props
}: CardContentProps) {
	return (
		<div className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props}>
			{children}
		</div>
	);
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
	return (
		<div
			className={cn(
				"flex items-center border-t border-gray-100 px-5 py-3 sm:px-6",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
