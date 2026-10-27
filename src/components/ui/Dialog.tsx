import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";
import { create } from "zustand";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: React.ReactNode;
	description?: React.ReactNode;
	children?: React.ReactNode;
	footer?: React.ReactNode;
	size?: "sm" | "md" | "lg";
	/** Lista rolável no corpo (ex.: seleção de inscritos) */
	scrollBody?: boolean;
}

const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

/** Diálogo acessível: foco preso, fecha com Esc e clique fora */
export function Dialog({
	open,
	onOpenChange,
	title,
	description,
	children,
	footer,
	size = "md",
	scrollBody = false,
}: DialogProps) {
	return (
		<RadixDialog.Root open={open} onOpenChange={onOpenChange}>
			<RadixDialog.Portal>
				<RadixDialog.Overlay className="fixed inset-0 z-50 bg-ink/40 animate-fade-in" />
				<RadixDialog.Content
					className={cn(
						"fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
						"rounded-2xl bg-surface shadow-pop animate-pop-in focus:outline-none",
						widths[size],
					)}
				>
					<div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
						<div className="min-w-0">
							<RadixDialog.Title className="font-serif text-xl font-medium">
								{title}
							</RadixDialog.Title>
							{description ? (
								<RadixDialog.Description className="mt-1 text-[13px] text-muted">
									{description}
								</RadixDialog.Description>
							) : (
								<RadixDialog.Description className="sr-only">
									{typeof title === "string" ? title : "Diálogo"}
								</RadixDialog.Description>
							)}
						</div>
						<RadixDialog.Close asChild>
							<Button variant="ghost" size="icon-sm" aria-label="Fechar">
								<X />
							</Button>
						</RadixDialog.Close>
					</div>
					{children && (
						<div
							className={cn(
								"px-6 pb-5",
								scrollBody && "min-h-0 flex-1 overflow-y-auto",
							)}
						>
							{children}
						</div>
					)}
					{footer && (
						<div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">
							{footer}
						</div>
					)}
				</RadixDialog.Content>
			</RadixDialog.Portal>
		</RadixDialog.Root>
	);
}

// ── Confirmação imperativa (substitui window.confirm) ─────────

interface OpcoesConfirmacao {
	titulo: string;
	descricao?: React.ReactNode;
	confirmar?: string;
	cancelar?: string;
	perigo?: boolean;
}

interface ConfirmState {
	aberto: boolean;
	opcoes: OpcoesConfirmacao | null;
	resolver: ((ok: boolean) => void) | null;
}

const useConfirmStore = create<ConfirmState>(() => ({
	aberto: false,
	opcoes: null,
	resolver: null,
}));

export function confirmar(opcoes: OpcoesConfirmacao): Promise<boolean> {
	return new Promise((resolve) => {
		useConfirmStore.getState().resolver?.(false);
		useConfirmStore.setState({ aberto: true, opcoes, resolver: resolve });
	});
}

function responder(ok: boolean) {
	const { resolver } = useConfirmStore.getState();
	resolver?.(ok);
	useConfirmStore.setState({ aberto: false, resolver: null });
}

/** Montado uma vez na raiz do app */
export function ConfirmHost() {
	const { aberto, opcoes } = useConfirmStore();
	if (!opcoes) return null;
	return (
		<Dialog
			open={aberto}
			onOpenChange={(open) => !open && responder(false)}
			title={opcoes.titulo}
			description={opcoes.descricao}
			size="sm"
			footer={
				<>
					<Button variant="secondary" onClick={() => responder(false)}>
						{opcoes.cancelar ?? "Cancelar"}
					</Button>
					<Button
						variant={opcoes.perigo ? "danger-solid" : "primary"}
						onClick={() => responder(true)}
						autoFocus
					>
						{opcoes.confirmar ?? "Confirmar"}
					</Button>
				</>
			}
		/>
	);
}
