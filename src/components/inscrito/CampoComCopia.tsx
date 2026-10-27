import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { copiarParaClipboard } from "../../utils/clipboard";
import { cn } from "../../utils/cn";
import { Faltando } from "../ui/misc";

interface CampoComCopiaProps {
	label: string;
	valor: string | boolean | null | undefined;
	obrigatorio?: boolean;
	tipo?: "texto" | "boolean";
	className?: string;
}

/** Par rótulo/valor da ficha, com botão de copiar sempre acessível */
export function CampoComCopia({
	label,
	valor,
	obrigatorio = false,
	tipo = "texto",
	className,
}: CampoComCopiaProps) {
	const [copiado, setCopiado] = useState(false);
	const vazio =
		valor === null || valor === undefined || String(valor).trim() === "";

	const texto = vazio
		? null
		: tipo === "boolean"
			? valor === true || valor === "true" || valor === "Sim"
				? "Sim"
				: "Não"
			: String(valor);

	async function handleCopiar() {
		if (!texto) return;
		if (await copiarParaClipboard(texto)) {
			setCopiado(true);
			setTimeout(() => setCopiado(false), 1800);
		}
	}

	return (
		<div className={cn("group min-w-0", className)}>
			<dt className="text-xs text-muted">{label}</dt>
			<dd className="mt-0.5 flex min-w-0 items-start gap-1">
				{vazio ? (
					obrigatorio ? (
						<Faltando />
					) : (
						<span className="text-faint">—</span>
					)
				) : (
					<>
						<span className="min-w-0 break-words">{texto}</span>
						<button
							type="button"
							onClick={handleCopiar}
							aria-label={copiado ? `${label} copiado` : `Copiar ${label}`}
							className={cn(
								"-my-0.5 shrink-0 rounded p-1 transition",
								copiado
									? "text-ok"
									: "text-faint hover:text-ink focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
							)}
						>
							{copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
						</button>
					</>
				)}
			</dd>
		</div>
	);
}
