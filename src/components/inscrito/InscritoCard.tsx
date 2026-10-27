import { Link } from "@tanstack/react-router";
import type { Inscricao } from "../../types/inscricao";
import { Badge } from "../ui/Badge";
import { tomCompletude } from "../ui/ProgressBar";
import { Avatar } from "../ui/misc";
import { WhatsAppButton } from "./WhatsAppButton";

const tomBadge = { ok: "ok", warn: "warn", danger: "danger" } as const;

/** Linha compacta de inscrito pendente (usada no Painel) */
export function InscritoCard({ inscricao }: { inscricao: Inscricao }) {
	const nome = inscricao.crismando.nome ?? "Nome não informado";
	const faltantes = inscricao.camposFaltantes;

	return (
		<li className="flex items-center gap-3.5 border-t border-line/80 px-5 py-3 sm:px-6">
			<Avatar nome={nome} />
			<div className="min-w-0 flex-1">
				<Link
					to="/inscritos/$id"
					params={{ id: inscricao.id }}
					className="font-medium text-ink no-underline hover:text-accent"
				>
					{nome}
				</Link>
				{faltantes.length > 0 && (
					<p className="truncate text-xs text-muted">
						Faltam: {faltantes.slice(0, 3).join(", ").toLowerCase()}
						{faltantes.length > 3 && ` e mais ${faltantes.length - 3}`}
					</p>
				)}
			</div>
			<Badge tone={tomBadge[tomCompletude(inscricao.completude)]}>
				{inscricao.completude}%
			</Badge>
			<WhatsAppButton inscricao={inscricao} />
		</li>
	);
}
