import { Link } from "@tanstack/react-router";
import { cn } from "../../utils/cn";

interface Migalha {
	label: string;
	to?: string;
	params?: Record<string, string>;
}

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
	/** Largura máxima do conteúdo */
	width?: "default" | "narrow";
	title?: React.ReactNode;
	/** Linha pequena acima do título */
	eyebrow?: React.ReactNode;
	description?: React.ReactNode;
	actions?: React.ReactNode;
	breadcrumbs?: Migalha[];
}

export function PageContainer({
	children,
	className,
	width = "default",
	title,
	eyebrow,
	description,
	actions,
	breadcrumbs,
}: PageContainerProps) {
	return (
		<div
			className={cn(
				"mx-auto flex flex-col gap-6 px-4 pt-6 pb-16 sm:px-8 lg:px-12 lg:pt-8 [&>*]:min-w-0",
				width === "narrow" ? "max-w-3xl" : "max-w-[1088px]",
				className,
			)}
		>
			{breadcrumbs && breadcrumbs.length > 0 && (
				<nav aria-label="Navegação estrutural" className="-mb-2 text-[13px] text-muted">
					<ol className="flex flex-wrap items-center gap-1.5">
						{breadcrumbs.map((m, i) => (
							<li key={m.label} className="flex items-center gap-1.5">
								{i > 0 && <span aria-hidden="true">/</span>}
								{m.to ? (
									<Link
										to={m.to}
										params={m.params}
										className="text-accent no-underline hover:text-accent-hover"
									>
										{m.label}
									</Link>
								) : (
									<span aria-current="page" className="truncate">
										{m.label}
									</span>
								)}
							</li>
						))}
					</ol>
				</nav>
			)}
			{(title || actions) && (
				<header className="flex flex-wrap items-end justify-between gap-4">
					<div className="min-w-0">
						{eyebrow && <div className="mb-1.5 text-[13px] text-muted">{eyebrow}</div>}
						{title && (
							<h1 className="font-serif text-[30px] leading-tight font-normal tracking-[-0.01em] sm:text-[34px]">
								{title}
							</h1>
						)}
						{description && <p className="mt-1.5 text-muted">{description}</p>}
					</div>
					{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
				</header>
			)}
			{children}
		</div>
	);
}
