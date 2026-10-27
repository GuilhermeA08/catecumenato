import { MoreHorizontal } from "lucide-react";
import type * as React from "react";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";

export interface ItemMenu {
	label: string;
	icon?: React.ReactNode;
	onSelect: () => void;
	perigo?: boolean;
	separadoAntes?: boolean;
}

/** Botão "Mais ações" com menu suspenso acessível (teclado e clique fora) */
export function MenuAcoes({
	itens,
	label = "Mais ações",
}: {
	itens: ItemMenu[];
	label?: string;
}) {
	const [aberto, setAberto] = useState(false);
	const raizRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const menuId = useId();

	useEffect(() => {
		if (!aberto) return;
		menuRef.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
		function fora(e: PointerEvent) {
			if (!raizRef.current?.contains(e.target as Node)) setAberto(false);
		}
		document.addEventListener("pointerdown", fora);
		return () => document.removeEventListener("pointerdown", fora);
	}, [aberto]);

	function fechar() {
		setAberto(false);
		raizRef.current
			?.querySelector<HTMLButtonElement>("[aria-haspopup]")
			?.focus();
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		const botoes = [
			...(menuRef.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ??
				[]),
		];
		const atual = botoes.indexOf(document.activeElement as HTMLButtonElement);
		if (e.key === "Escape") {
			e.preventDefault();
			fechar();
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			const passo = e.key === "ArrowDown" ? 1 : -1;
			botoes[(atual + passo + botoes.length) % botoes.length]?.focus();
		} else if (e.key === "Home" || e.key === "End") {
			e.preventDefault();
			botoes[e.key === "Home" ? 0 : botoes.length - 1]?.focus();
		} else if (e.key === "Tab") {
			setAberto(false);
		}
	}

	return (
		<div ref={raizRef} className="relative">
			<Button
				variant="secondary"
				size="icon"
				aria-label={label}
				title={label}
				aria-haspopup="menu"
				aria-expanded={aberto}
				aria-controls={aberto ? menuId : undefined}
				onClick={() => setAberto((a) => !a)}
			>
				<MoreHorizontal />
			</Button>
			{aberto && (
				<div
					ref={menuRef}
					id={menuId}
					role="menu"
					aria-label={label}
					onKeyDown={handleKeyDown}
					className="absolute right-0 z-30 mt-1.5 flex w-64 max-w-[calc(100vw-2rem)] flex-col rounded-xl bg-surface p-1.5 shadow-pop animate-pop-in"
				>
					{itens.map((item) => (
						<Fragment key={item.label}>
							{item.separadoAntes && <hr className="my-1 border-line" />}
							<button
								type="button"
								role="menuitem"
								tabIndex={-1}
								onClick={() => {
									fechar();
									item.onSelect();
								}}
								className={cn(
									"flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
									item.perigo
										? "text-danger-ink hover:bg-danger-soft focus-visible:bg-danger-soft"
										: "text-ink hover:bg-sand focus-visible:bg-sand",
								)}
							>
								{item.icon}
								{item.label}
							</button>
						</Fragment>
					))}
				</div>
			)}
		</div>
	);
}
