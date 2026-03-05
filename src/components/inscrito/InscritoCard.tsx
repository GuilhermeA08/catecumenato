import { Link } from "@tanstack/react-router";
import { AlertTriangle, Eye, MessageCircle } from "lucide-react";
import { abrirWhatsApp } from "../../features/inscricoes/services/whatsappService";
import type { Inscricao } from "../../types/inscricao";
import { temValor } from "../../utils/completude";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { StatusBadge } from "./StatusBadge";

interface InscritoCardProps {
	inscricao: Inscricao;
}

function calcularCamposFaltantesPadrinho(padrinho: Inscricao["padrinho"]): string[] {
	const campos: Array<{ key: keyof typeof padrinho; label: string }> = [
		{ key: "nome", label: "Nome" },
		{ key: "estadoCivil", label: "Estado Civil" },
		{ key: "celular", label: "Celular" },
		{ key: "endereco", label: "Endereço" },
		{ key: "bairro", label: "Bairro" },
		{ key: "municipio", label: "Município" },
	];
	return campos
		.filter((c) => !temValor(padrinho[c.key]))
		.map((c) => c.label);
}

interface InscritoCardProps {
	inscricao: Inscricao;
}

export function InscritoCard({ inscricao }: InscritoCardProps) {
	const nome = inscricao.crismando.nome ?? "Nome não informado";
	const municipio = inscricao.crismando.municipio;
	const celular = inscricao.crismando.celular;
	const padrinhoFaltantes = calcularCamposFaltantesPadrinho(inscricao.padrinho);

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
				{padrinhoFaltantes.length > 0 && (
					<div
						className="mb-3 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700"
						title={`Padrinho/Madrinha — faltam: ${padrinhoFaltantes.join(", ")}`}
					>
						<AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
						<span>
							<span className="font-medium">Padrinho/Madrinha:</span>{" "}
							{padrinhoFaltantes.length} campo
							{padrinhoFaltantes.length > 1 ? "s" : ""} incompleto
							{padrinhoFaltantes.length > 1 ? "s" : ""} — {padrinhoFaltantes.join(", ")}
						</span>
					</div>
				)}
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
