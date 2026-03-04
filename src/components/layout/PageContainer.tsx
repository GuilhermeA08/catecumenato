import { cn } from "../../utils/cn";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
	title?: string;
	description?: string;
	actions?: React.ReactNode;
}

export function PageContainer({
	children,
	className,
	title,
	description,
	actions,
}: PageContainerProps) {
	return (
		<main className={cn("mx-auto max-w-6xl px-4 py-6", className)}>
			{(title || actions) && (
				<div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div>
						{title && (
							<h1 className="text-2xl font-bold text-gray-900">{title}</h1>
						)}
						{description && (
							<p className="mt-1 text-sm text-gray-500">{description}</p>
						)}
					</div>
					{actions && <div className="flex items-center gap-2">{actions}</div>}
				</div>
			)}
			{children}
		</main>
	);
}
