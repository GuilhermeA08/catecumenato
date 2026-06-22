import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	CheckCircle,
	Clock,
	Download,
	FileDown,
	Upload,
	Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InscritoCard } from "../components/inscrito/InscritoCard";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/Card";
import {
	exportarJSON,
	importarJSON,
} from "../features/inscricoes/services/jsonService";
import { useInscricoesStore } from "../stores/inscricoesStore";
import { Status } from "../types/enums";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

function StatCard({
	label,
	value,
	icon,
	color,
	to,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
	color: string;
	to?: string;
}) {
	const content = (
		<Card className="transition-shadow hover:shadow-md">
			<CardContent className="pt-5">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-sm text-gray-500">{label}</p>
						<p className={`mt-1 text-4xl font-bold ${color}`}>{value}</p>
					</div>
					<div
						className={`rounded-xl p-3 ${color === "text-blue-600" ? "bg-blue-50" : color === "text-red-600" ? "bg-red-50" : "bg-green-50"}`}
					>
						{icon}
					</div>
				</div>
			</CardContent>
		</Card>
	);

	if (to) {
		return <Link to={to}>{content}</Link>;
	}
	return content;
}

function DashboardPage() {
	const navigate = useNavigate();
	const { carregado, inscricoes, getTotais, exportar } = useInscricoesStore();
	const totais = getTotais();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [feedback, setFeedback] = useState<{
		tipo: "sucesso" | "erro";
		mensagem: string;
	} | null>(null);

	useEffect(() => {
		if (!carregado) navigate({ to: "/" });
	}, [carregado, navigate]);

	useEffect(() => {
		if (feedback) {
			const timer = setTimeout(() => setFeedback(null), 5000);
			return () => clearTimeout(timer);
		}
	}, [feedback]);

	async function handleImportar(evento: React.ChangeEvent<HTMLInputElement>) {
		const file = evento.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith(".json")) {
			setFeedback({ tipo: "erro", mensagem: "Selecione um arquivo .json" });
			evento.target.value = "";
			return;
		}

		const resultado = await importarJSON(file);
		setFeedback({
			tipo: resultado.sucesso ? "sucesso" : "erro",
			mensagem: resultado.mensagem,
		});
		evento.target.value = "";
	}

	const pendentes = inscricoes
		.filter((i) => i.status === Status.PENDENTE)
		.sort((a, b) => a.completude - b.completude)
		.slice(0, 5);

	return (
		<PageContainer
			title="Dashboard"
			description="Visão geral das inscrições do Catecumenato (Crisma)"
			actions={
				<div className="flex items-center gap-2">
					<Button onClick={exportar} variant="secondary" size="sm">
						<Download className="h-4 w-4" />
						CSV
					</Button>
					<Button
						onClick={exportarJSON}
						variant="secondary"
						size="sm"
						title="Exportar tudo (JSON)"
					>
						<FileDown className="h-4 w-4" />
						JSON
					</Button>
					<Button
						onClick={() => fileInputRef.current?.click()}
						variant="secondary"
						size="sm"
						title="Importar backup JSON"
					>
						<Upload className="h-4 w-4" />
						Restaurar
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".json"
						className="hidden"
						onChange={handleImportar}
					/>
				</div>
			}
		>
			{feedback && (
				<div
					className={`mb-6 rounded-lg px-4 py-3 text-sm ${
						feedback.tipo === "sucesso"
							? "bg-green-50 text-green-800 border border-green-200"
							: "bg-red-50 text-red-800 border border-red-200"
					}`}
				>
					{feedback.mensagem}
				</div>
			)}
			{/* Stat Cards */}
			<div className="mb-8 grid gap-4 sm:grid-cols-3">
				<StatCard
					label="Total de Inscritos"
					value={totais.total}
					icon={<Users className="h-5 w-5 text-blue-600" />}
					color="text-blue-600"
					to="/inscritos"
				/>
				<StatCard
					label="Pendentes"
					value={totais.pendentes}
					icon={<Clock className="h-5 w-5 text-red-600" />}
					color="text-red-600"
					to="/inscritos"
				/>
				<StatCard
					label="Concluídos"
					value={totais.concluidos}
					icon={<CheckCircle className="h-5 w-5 text-green-600" />}
					color="text-green-600"
					to="/inscritos"
				/>
			</div>

			{/* Progresso geral */}
			{totais.total > 0 && (
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Progresso Geral</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<div className="mb-2 flex justify-between text-sm text-gray-500">
									<span>Inscrições concluídas</span>
									<span>
										{Math.round((totais.concluidos / totais.total) * 100)}%
									</span>
								</div>
								<div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
									<div
										className="h-full rounded-full bg-green-500 transition-all duration-700"
										style={{
											width: `${(totais.concluidos / totais.total) * 100}%`,
										}}
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Pendentes mais urgentes */}
			{pendentes.length > 0 && (
				<div>
					<div className="mb-4 flex items-center justify-between">
						<h2 className="font-semibold text-gray-900">
							Pendências mais urgentes
							<span className="ml-2 text-sm font-normal text-gray-500">
								(menor completude)
							</span>
						</h2>
						<Link to="/inscritos">
							<Button variant="ghost" size="sm">
								Ver todos
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
					</div>
					<div className="flex flex-col gap-3">
						{pendentes.map((inscricao) => (
							<InscritoCard key={inscricao.id} inscricao={inscricao} />
						))}
					</div>
				</div>
			)}

			{totais.total > 0 && totais.pendentes === 0 && (
				<div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
					<CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-500" />
					<h3 className="font-semibold text-green-800">
						Todas as inscrições estão completas!
					</h3>
					<p className="mt-1 text-sm text-green-600">
						Parabéns! Nenhum campo obrigatório faltando.
					</p>
				</div>
			)}
		</PageContainer>
	);
}
