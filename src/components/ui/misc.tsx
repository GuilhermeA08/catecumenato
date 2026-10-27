import type * as React from "react";
import { cn } from "../../utils/cn";

/** Círculo com as iniciais do nome */
export function Avatar({
	nome,
	size = "md",
	className,
}: {
	nome: string | null | undefined;
	size?: "sm" | "md" | "lg";
	className?: string;
}) {
	const iniciais =
		(nome ?? "")
			.split(/\s+/)
			.filter((p) => p.length > 2 || /^[A-ZÀ-Ú]/.test(p))
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase())
			.join("") || "?";
	return (
		<span
			aria-hidden="true"
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-full bg-sand font-semibold text-ink-2",
				size === "sm" && "size-8 text-xs",
				size === "md" && "size-9 text-[13px]",
				size === "lg" && "size-14 font-serif text-[22px] font-normal",
				className,
			)}
		>
			{iniciais}
		</span>
	);
}

/** Estado vazio com ícone, título, texto e ação */
export function EmptyState({
	icon,
	title,
	children,
	action,
	className,
}: {
	icon?: React.ReactNode;
	title: string;
	children?: React.ReactNode;
	action?: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center gap-2 px-6 py-12 text-center",
				className,
			)}
		>
			{icon && (
				<div className="mb-2 flex size-12 items-center justify-center rounded-full bg-sand text-muted [&_svg]:size-5">
					{icon}
				</div>
			)}
			<p className="font-serif text-lg">{title}</p>
			{children && <p className="max-w-sm text-[13px] text-muted">{children}</p>}
			{action && <div className="mt-3">{action}</div>}
		</div>
	);
}

/** Grupo de botões exclusivos (filtros, chamada) */
export function Segmented<T extends string>({
	value,
	onChange,
	options,
	label,
	size = "md",
	className,
}: {
	value: T;
	onChange: (v: T) => void;
	options: { value: T; label: React.ReactNode; activeClassName?: string }[];
	label: string;
	size?: "sm" | "md";
	className?: string;
}) {
	return (
		<div
			role="radiogroup"
			aria-label={label}
			className={cn("inline-flex gap-0.5 rounded-[10px] bg-sand p-[3px]", className)}
		>
			{options.map((opt) => {
				const ativo = opt.value === value;
				return (
					<button
						key={opt.value}
						type="button"
						role="radio"
						aria-checked={ativo}
						onClick={() => onChange(opt.value)}
						className={cn(
							"rounded-lg px-3 whitespace-nowrap transition-colors",
							size === "sm" ? "h-8 text-[13px]" : "h-9 text-sm",
							ativo
								? (opt.activeClassName ??
										"bg-surface font-medium text-ink shadow-[0_1px_2px_rgb(20_20_19/0.08)]")
								: "text-ink-2 hover:text-ink",
						)}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}

/** Abas simples e acessíveis */
export function Tabs<T extends string>({
	value,
	onChange,
	tabs,
	label,
}: {
	value: T;
	onChange: (v: T) => void;
	tabs: { value: T; label: React.ReactNode }[];
	label: string;
}) {
	return (
		<div
			role="tablist"
			aria-label={label}
			className="flex gap-1 overflow-x-auto border-b border-line-strong/60"
		>
			{tabs.map((tab) => {
				const ativo = tab.value === value;
				return (
					<button
						key={tab.value}
						type="button"
						role="tab"
						id={`tab-${tab.value}`}
						aria-selected={ativo}
						aria-controls={`painel-${tab.value}`}
						onClick={() => onChange(tab.value)}
						className={cn(
							"-mb-px h-10 border-b-2 px-3.5 whitespace-nowrap transition-colors",
							ativo
								? "border-accent font-medium text-ink"
								: "border-transparent text-muted hover:text-ink",
						)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}

/** Cartão de número-resumo */
export function StatCard({
	label,
	value,
	hint,
	dot,
	className,
}: {
	label: string;
	value: React.ReactNode;
	hint?: React.ReactNode;
	dot?: string;
	className?: string;
}) {
	return (
		<div className={cn("rounded-[14px] bg-surface px-5 py-4 shadow-card", className)}>
			<div className="flex items-center gap-1.5 text-[13px] text-muted">
				{dot && (
					<span
						className="size-2 rounded-full"
						style={{ backgroundColor: dot }}
						aria-hidden="true"
					/>
				)}
				{label}
			</div>
			<div className="mt-1.5 font-serif text-[40px] leading-none tabular-nums">
				{value}
			</div>
			{hint && <div className="mt-2 text-xs text-muted">{hint}</div>}
		</div>
	);
}

/** Lista de definições (rótulo/valor) usada nas fichas */
export function Faltando() {
	return (
		<span className="inline-flex items-center gap-1.5 font-medium text-danger-ink">
			<span className="size-1.5 rounded-full bg-danger" aria-hidden="true" />
			Faltando
		</span>
	);
}
