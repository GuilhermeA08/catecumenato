import { cn } from "../../utils/cn";

interface ProgressBarProps {
	value: number; // 0-100
	className?: string;
	showLabel?: boolean;
}

function getColor(value: number): string {
	if (value >= 80) return "bg-green-500";
	if (value >= 50) return "bg-yellow-500";
	return "bg-red-500";
}

export function ProgressBar({
	value,
	className,
	showLabel = true,
}: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value));

	return (
		<div className={cn("flex items-center gap-3", className)}>
			<div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
				<div
					className={cn(
						"h-full rounded-full transition-all duration-500",
						getColor(clamped),
					)}
					style={{ width: `${clamped}%` }}
					role="progressbar"
					aria-valuenow={clamped}
					aria-valuemin={0}
					aria-valuemax={100}
				/>
			</div>
			{showLabel && (
				<span className="w-10 text-right text-xs font-semibold text-gray-600">
					{clamped}%
				</span>
			)}
		</div>
	);
}
