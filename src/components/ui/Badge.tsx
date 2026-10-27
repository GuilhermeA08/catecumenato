import type * as React from "react";
import { cn } from "../../utils/cn";

export type BadgeTone = "neutral" | "ok" | "warn" | "danger" | "accent";

const tones: Record<BadgeTone, string> = {
	neutral: "bg-sand text-ink-2",
	ok: "bg-ok-soft text-ok-ink",
	warn: "bg-warn-soft text-warn-ink",
	danger: "bg-danger-soft text-danger-ink",
	accent: "bg-accent-soft text-accent-hover",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
				tones[tone],
				className,
			)}
			{...props}
		/>
	);
}

/** Marcador colorido da turma (quadradinho + nome) */
export function TurmaTag({
	nome,
	cor,
	className,
}: {
	nome: string;
	cor: string;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex min-w-0 items-center gap-1.5 text-[13px] text-ink-2",
				className,
			)}
		>
			<span
				className="size-2.5 shrink-0 rounded-[3px]"
				style={{ backgroundColor: cor }}
				aria-hidden="true"
			/>
			<span className="truncate">{nome}</span>
		</span>
	);
}
