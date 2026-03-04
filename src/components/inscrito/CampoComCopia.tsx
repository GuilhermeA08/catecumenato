import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { copiarParaClipboard } from "../../utils/clipboard";
import { cn } from "../../utils/cn";
import { Badge } from "../ui/Badge";

interface CampoComCopiaProps {
	label: string;
	valor: string | boolean | null | undefined;
	obrigatorio?: boolean;
	tipo?: "texto" | "boolean";
}

export function CampoComCopia({
	label,
	valor,
	obrigatorio = false,
	tipo = "texto",
}: CampoComCopiaProps) {
	const [copiado, setCopiado] = useState(false);
	const vazio =
		valor === null || valor === undefined || String(valor).trim() === "";

	const textoExibicao = vazio
		? null
		: tipo === "boolean"
			? valor === true || valor === "true" || valor === "Sim"
				? "Sim"
				: "Não"
			: String(valor);

	async function handleCopiar() {
		if (!textoExibicao) return;
		const sucesso = await copiarParaClipboard(textoExibicao);
		if (sucesso) {
			setCopiado(true);
			setTimeout(() => setCopiado(false), 2000);
		}
	}

	return (
		<div
			className={cn(
				"group relative flex flex-col gap-1 rounded-lg border p-3 transition-colors",
				vazio && obrigatorio
					? "border-red-300 bg-red-50"
					: "border-gray-200 bg-gray-50 hover:border-gray-300",
			)}
		>
			<div className="flex items-start justify-between gap-2">
				<span className="text-xs font-medium uppercase tracking-wide text-gray-500">
					{label}
				</span>
				<div className="flex items-center gap-1.5">
					{vazio && obrigatorio && (
						<Badge variant="danger" className="shrink-0 text-[10px]">
							Faltando
						</Badge>
					)}
					{!vazio && (
						<button
							type="button"
							onClick={handleCopiar}
							title="Copiar"
							className={cn(
								"rounded p-1 transition-colors",
								copiado
									? "text-green-600"
									: "text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100",
							)}
						>
							{copiado ? (
								<Check className="h-3.5 w-3.5" />
							) : (
								<Copy className="h-3.5 w-3.5" />
							)}
						</button>
					)}
				</div>
			</div>
			<span
				className={cn(
					"text-sm",
					vazio ? "italic text-gray-400" : "font-medium text-gray-900",
				)}
			>
				{vazio ? "—" : textoExibicao}
			</span>
		</div>
	);
}
