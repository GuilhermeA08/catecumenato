import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { create } from "zustand";
import { gerarId } from "../../utils/id";
import { cn } from "../../utils/cn";

type Tipo = "sucesso" | "erro" | "info";

interface ToastItem {
	id: string;
	tipo: Tipo;
	mensagem: string;
}

interface ToastState {
	itens: ToastItem[];
	remover: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
	itens: [],
	remover: (id) => set((s) => ({ itens: s.itens.filter((t) => t.id !== id) })),
}));

function mostrar(tipo: Tipo, mensagem: string, duracao = 4500) {
	const id = gerarId();
	useToastStore.setState((s) => ({
		itens: [...s.itens.slice(-3), { id, tipo, mensagem }],
	}));
	setTimeout(() => useToastStore.getState().remover(id), duracao);
}

export const toast = {
	sucesso: (msg: string) => mostrar("sucesso", msg),
	erro: (msg: string) => mostrar("erro", msg, 7000),
	info: (msg: string) => mostrar("info", msg),
};

const icones = {
	sucesso: <CheckCircle2 className="size-4 text-ok" aria-hidden="true" />,
	erro: <CircleAlert className="size-4 text-danger" aria-hidden="true" />,
	info: <Info className="size-4 text-muted" aria-hidden="true" />,
};

/** Montado uma vez na raiz do app */
export function Toaster() {
	const { itens, remover } = useToastStore();
	return (
		<div
			className="pointer-events-none fixed right-4 bottom-4 left-4 z-[60] flex flex-col items-center gap-2 sm:left-auto sm:items-end"
			aria-live="polite"
		>
			{itens.map((t) => (
				<div
					key={t.id}
					role={t.tipo === "erro" ? "alert" : "status"}
					className={cn(
						"pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-surface px-4 py-3 text-sm shadow-pop animate-pop-in",
					)}
				>
					<span className="mt-0.5">{icones[t.tipo]}</span>
					<p className="flex-1 text-ink">{t.mensagem}</p>
					<button
						type="button"
						onClick={() => remover(t.id)}
						className="-m-1 rounded p-1 text-subtle hover:text-ink"
						aria-label="Fechar aviso"
					>
						<X className="size-3.5" />
					</button>
				</div>
			))}
		</div>
	);
}
