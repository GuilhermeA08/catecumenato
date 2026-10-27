import { cn } from "../../utils/cn";

interface ProgressBarProps {
	value: number; // 0-100
	className?: string;
	showLabel?: boolean;
	label?: string;
	/** Cor fixa; sem ela a cor segue a faixa (verde ≥ 100, âmbar ≥ 50, vermelho) */
	color?: string;
	size?: "sm" | "md";
}

export function tomCompletude(value: number): "ok" | "warn" | "danger" {
	if (value >= 100) return "ok";
	if (value >= 50) return "warn";
	return "danger";
}

const barColor = { ok: "bg-ok", warn: "bg-warn", danger: "bg-danger" };
const textColor = {
	ok: "text-ok-ink",
	warn: "text-warn-ink",
	danger: "text-danger-ink",
};

export function ProgressBar({
	value,
	className,
	showLabel = true,
	label = "Progresso",
	color,
	size = "sm",
}: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, Math.round(value)));
	const tom = tomCompletude(clamped);

	return (
		<div className={cn("flex items-center gap-2.5", className)}>
			<div
				className={cn(
					"flex-1 overflow-hidden rounded-full bg-sand",
					size === "sm" ? "h-1.5" : "h-2.5",
				)}
				role="progressbar"
				aria-label={label}
				aria-valuenow={clamped}
				aria-valuemin={0}
				aria-valuemax={100}
			>
				<div
					className={cn(
						"h-full rounded-full transition-[width] duration-500",
						!color && barColor[tom],
					)}
					style={{ width: `${clamped}%`, backgroundColor: color }}
				/>
			</div>
			{showLabel && (
				<span
					className={cn(
						"w-9 text-right text-xs font-medium tabular-nums",
						color ? "text-muted" : textColor[tom],
					)}
				>
					{clamped}%
				</span>
			)}
		</div>
	);
}
