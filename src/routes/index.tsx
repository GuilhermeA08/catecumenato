import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Church, UserPlus } from "lucide-react";
import { CSVUploader } from "../components/csv/CSVUploader";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { useInscricoesStore } from "../stores/inscricoesStore";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	const navigate = useNavigate();
	const { carregado, getTotais, importadoEm } = useInscricoesStore();
	const totais = getTotais();

	return (
		<PageContainer>
			<div className="mx-auto max-w-2xl">
				{/* Hero */}
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
						<Church className="h-8 w-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900">
						Sistema de Crisma
					</h1>
					<p className="mt-2 text-gray-500">
						Diocese de Santa Luzia de Mossoró · Paróquia de Santana
					</p>
				</div>

				{/* Dados na memória */}
				{carregado && totais.total > 0 && (
					<div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="font-semibold text-blue-900">
									{totais.total} inscrição{totais.total > 1 ? "ões" : ""}{" "}
									carregada{totais.total > 1 ? "s" : ""}
								</p>
								<p className="text-sm text-blue-700">
									{totais.pendentes} pendente{totais.pendentes !== 1 ? "s" : ""}{" "}
									· {totais.concluidos} concluído
									{totais.concluidos !== 1 ? "s" : ""}
									{importadoEm &&
										` · importado em ${new Date(importadoEm).toLocaleDateString("pt-BR")}`}
								</p>
							</div>
							<Button onClick={() => navigate({ to: "/dashboard" })}>
								Ver Dashboard
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}

				{/* Card de Upload */}
				<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<h2 className="mb-1 text-lg font-semibold text-gray-900">
						{carregado ? "Importar novo arquivo" : "Importar inscrições"}
					</h2>
					<p className="mb-5 text-sm text-gray-500">
						Importe um arquivo CSV com as inscrições do Catecumenato (Crisma)
					</p>
					<CSVUploader />
					<div className="mt-4 flex items-center gap-3">
						<hr className="flex-1 border-gray-200" />
						<span className="text-xs text-gray-400">ou</span>
						<hr className="flex-1 border-gray-200" />
					</div>
					<div className="mt-4 text-center">
						<Link to="/inscritos/novo">
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
							>
								<UserPlus className="h-4 w-4" />
								Cadastrar manualmente
							</button>
						</Link>
					</div>
				</div>

				{/* Info */}
				<div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
					<h3 className="mb-3 font-semibold text-gray-700">Como usar</h3>
					<ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
						<li>Baixe o modelo CSV e preencha com os dados dos inscritos</li>
						<li>Importe o arquivo CSV aqui</li>
						<li>Visualize o dashboard e identifique os pendentes</li>
						<li>
							Use o botão WhatsApp para avisar inscritos com dados incompletos
						</li>
						<li>
							Edite os dados conforme necessário e exporte o CSV atualizado
						</li>
					</ol>
				</div>
			</div>
		</PageContainer>
	);
}
