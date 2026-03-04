import { Link } from "@tanstack/react-router";
import { Eye, MessageCircle } from "lucide-react";
import { abrirWhatsApp } from "../../features/inscricoes/services/whatsappService";
import type { Inscricao } from "../../types/inscricao";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { StatusBadge } from "./StatusBadge";

interface InscritoCardProps {
	inscricao: Inscricao;
}

export function InscritoCard({ inscricao }: InscritoCardProps) {
	const nome = inscricao.crismando.nome ?? "Nome não informado";
	const municipio = inscricao.crismando.municipio;
	const celular = inscricao.crismando.celular;

	return (
		<div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
			<div className="min-w-0 flex-1">
				<div className="mb-1 flex items-center gap-2">
					<h3 className="truncate font-semibold text-gray-900">{nome}</h3>
					<StatusBadge status={inscricao.status} size="sm" />
				</div>
				<div className="mb-3 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
					{municipio && <span>{municipio}</span>}
					{celular && <span>{celular}</span>}
					{inscricao.camposFaltantes.length > 0 && (
						<span className="text-red-500">
							{inscricao.camposFaltantes.length} campo
							{inscricao.camposFaltantes.length > 1 ? "s" : ""} faltando
						</span>
					)}
				</div>
				<ProgressBar value={inscricao.completude} />
			</div>
			<div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
				{celular && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => abrirWhatsApp(inscricao)}
						title="WhatsApp"
						className="text-green-600 hover:text-green-700"
					>
						<MessageCircle className="h-4 w-4" />
						<span className="hidden sm:inline">WhatsApp</span>
					</Button>
				)}
				<Link to="/inscritos/$id" params={{ id: inscricao.id }}>
					<Button variant="secondary" size="sm">
						<Eye className="h-4 w-4" />
						<span className="hidden sm:inline">Ver</span>
					</Button>
				</Link>
			</div>
		</div>
	);
}
