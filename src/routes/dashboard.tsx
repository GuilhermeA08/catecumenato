import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { CheckCircle2, Download, Plus } from "lucide-react";
import { useMemo } from "react";
import { InscritoCard } from "../components/inscrito/InscritoCard";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Card, CardFooter, CardHeader } from "../components/ui/Card";
import { EmptyState, StatCard } from "../components/ui/misc";
import { exportarJSON } from "../features/inscricoes/services/jsonService";
import { useEncontrosStore } from "../stores/encontrosStore";
import { useInscricoesStore } from "../stores/inscricoesStore";
import { usePresencasStore } from "../stores/presencasStore";
import { useTurmasStore } from "../stores/turmasStore";
import { Status } from "../types/enums";
import { calcularPercentualFrequencia } from "../utils/presenca";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: () => {
		if (!useInscricoesStore.getState().carregado) throw redirect({ to: "/" });
	},
	component: DashboardPage,
});

function saudacao(): string {
	const h = new Date().getHours();
	if (h < 12) return "Bom dia";
	if (h < 18) return "Boa tarde";
	return "Boa noite";
}

function DashboardPage() {
	const inscricoes = useInscricoesStore((s) => s.inscricoes);
	const exportarCSV = useInscricoesStore((s) => s.exportar);
	const turmas = useTurmasStore((s) => s.turmas);
	const encontros = useEncontrosStore((s) => s.encontros);
	const presencas = usePresencasStore((s) => s.presencas);

	const dados = useMemo(() => {
		const total = inscricoes.length;
		const concluidos = inscricoes.filter((i) => i.status === Status.CONCLUIDO);
		const pendentes = inscricoes.filter((i) => i.status === Status.PENDENTE);
		const quaseProntos = pendentes.filter((i) => i.camposFaltantes.length <= 2);
		const semPadrinho = pendentes.filter((i) =>
			i.camposFaltantes.some((c) => c.toLowerCase().includes("padrinho")),
		).length;
		const semTurma = inscricoes.filter((i) => !i.turmaId).length;
		const urgentes = [...pendentes]
			.sort((a, b) => a.completude - b.completude)
			.slice(0, 5);

		const porTurma = turmas.map((turma) => {
			const membros = new Set(
				inscricoes.filter((i) => i.turmaId === turma.id).map((i) => i.id),
			);
			const idsEncontros = new Set(
				encontros.filter((e) => e.turmaId === turma.id).map((e) => e.id),
			);
			const daTurma = presencas.filter(
				(p) => idsEncontros.has(p.encontroId) && membros.has(p.inscritoId),
			);
			return {
				turma,
				membros: membros.size,
				frequencia: calcularPercentualFrequencia(daTurma),
			};
		});

		const encontrosComChamada = new Set(
			presencas.filter((p) => p.status !== "pendente").map((p) => p.encontroId),
		).size;

		return {
			total,
			concluidos: concluidos.length,
			pendentes: pendentes.length,
			quaseProntos: quaseProntos.length,
			semPadrinho,
			semTurma,
			urgentes,
			porTurma,
			frequenciaGeral: calcularPercentualFrequencia(presencas),
			encontrosComChamada,
		};
	}, [inscricoes, turmas, encontros, presencas]);

	const pct = (n: number) => (dados.total ? (n / dados.total) * 100 : 0);
	const titulo =
		dados.pendentes === 0
			? `${saudacao()}. Todas as fichas estão completas.`
			: `${saudacao()}. ${dados.pendentes} ficha${dados.pendentes > 1 ? "s ainda precisam" : " ainda precisa"} de atenção.`;

	return (
		<PageContainer
			eyebrow="Crisma · Diocese de Santa Luzia de Mossoró"
			title={titulo}
			actions={
				<>
					<Button variant="secondary" onClick={exportarCSV}>
						<Download />
						Exportar CSV
					</Button>
					<Button variant="secondary" onClick={exportarJSON}>
						Backup
					</Button>
					<ButtonLink to="/inscritos/novo">
						<Plus />
						Novo inscrito
					</ButtonLink>
				</>
			}
		>
			<section
				aria-label="Resumo"
				className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3"
			>
				<Link to="/inscritos" className="no-underline text-inherit">
					<StatCard
						label="Inscritos"
						value={dados.total}
						hint={
							dados.semTurma > 0
								? `${dados.semTurma} sem turma`
								: "Todos com turma"
						}
						className="transition-shadow hover:shadow-pop"
					/>
				</Link>
				<Link
					to="/inscritos"
					search={{ status: Status.PENDENTE }}
					className="no-underline text-inherit"
				>
					<StatCard
						label="Pendentes"
						value={dados.pendentes}
						dot="var(--color-warn)"
						hint={
							dados.semPadrinho > 0
								? `${dados.semPadrinho} com dados do padrinho faltando`
								: "Clique para ver a lista"
						}
						className="transition-shadow hover:shadow-pop"
					/>
				</Link>
				<Link
					to="/inscritos"
					search={{ status: Status.CONCLUIDO }}
					className="no-underline text-inherit"
				>
					<StatCard
						label="Concluídos"
						value={dados.concluidos}
						dot="var(--color-ok)"
						hint={`${Math.round(pct(dados.concluidos))}% das fichas`}
						className="transition-shadow hover:shadow-pop"
					/>
				</Link>
				<StatCard
					label="Frequência média"
					value={dados.frequenciaGeral === null ? "—" : `${dados.frequenciaGeral}%`}
					hint={
						dados.encontrosComChamada > 0
							? `em ${dados.encontrosComChamada} encontro${dados.encontrosComChamada > 1 ? "s" : ""} com chamada`
							: "Nenhuma chamada registrada"
					}
				/>
			</section>

			{dados.total > 0 && (
				<Card className="flex flex-col gap-3 px-5 py-5 sm:px-6">
					<div className="flex flex-wrap items-baseline justify-between gap-3">
						<h2 className="font-serif text-xl font-medium">Fichas concluídas</h2>
						<span className="text-muted tabular-nums">
							{dados.concluidos} de {dados.total}
						</span>
					</div>
					<div
						role="progressbar"
						aria-label="Fichas concluídas"
						aria-valuenow={Math.round(pct(dados.concluidos))}
						aria-valuemin={0}
						aria-valuemax={100}
						className="flex h-2.5 overflow-hidden rounded-full bg-sand"
					>
						<div className="bg-ok" style={{ width: `${pct(dados.concluidos)}%` }} />
						<div className="bg-[#e3b979]" style={{ width: `${pct(dados.quaseProntos)}%` }} />
					</div>
					<div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
						<Legenda cor="var(--color-ok)">Concluídas ({dados.concluidos})</Legenda>
						<Legenda cor="#e3b979">Faltam 1–2 campos ({dados.quaseProntos})</Legenda>
						<Legenda cor="var(--color-sand)" borda>
							Faltam 3+ campos ({dados.pendentes - dados.quaseProntos})
						</Legenda>
					</div>
				</Card>
			)}

			<div className="flex flex-wrap items-start gap-5">
				<Card className="min-w-0 flex-[999_1_480px] overflow-hidden">
					<CardHeader
						title="Pendências mais urgentes"
						actions={
							dados.pendentes > 0 && (
								<Link
									to="/inscritos"
									search={{ status: Status.PENDENTE }}
									className="text-sm font-medium text-accent no-underline hover:text-accent-hover"
								>
									Ver todas
								</Link>
							)
						}
					/>
					{dados.urgentes.length > 0 ? (
						<ul className="m-0 list-none p-0">
							{dados.urgentes.map((inscricao) => (
								<InscritoCard key={inscricao.id} inscricao={inscricao} />
							))}
						</ul>
					) : (
						<EmptyState icon={<CheckCircle2 />} title="Nenhuma pendência">
							Todas as fichas têm os campos obrigatórios preenchidos.
						</EmptyState>
					)}
				</Card>

				<Card className="min-w-0 flex-[1_1_300px]">
					<CardHeader title="Turmas" />
					<div className="flex flex-col gap-4 px-5 pb-5 sm:px-6">
						{dados.porTurma.length === 0 && (
							<p className="text-[13px] text-muted">
								Nenhuma turma criada.{" "}
								<Link to="/turmas" className="text-accent">
									Criar turma
								</Link>
							</p>
						)}
						{dados.porTurma.map(({ turma, membros, frequencia }) => (
							<Link
								key={turma.id}
								to="/turmas/$id"
								params={{ id: turma.id }}
								className="group flex flex-col gap-2 text-ink no-underline"
							>
								<div className="flex justify-between gap-2">
									<span className="flex min-w-0 items-center gap-2 font-medium group-hover:text-accent">
										<span
											className="size-2.5 shrink-0 rounded-[3px]"
											style={{ backgroundColor: turma.cor }}
											aria-hidden="true"
										/>
										<span className="truncate">{turma.nome}</span>
									</span>
									<span className="shrink-0 text-muted tabular-nums">
										{membros} · {frequencia === null ? "sem chamada" : `${frequencia}%`}
									</span>
								</div>
								<div className="h-1.5 overflow-hidden rounded-full bg-sand">
									<div
										className="h-full rounded-full"
										style={{ width: `${frequencia ?? 0}%`, backgroundColor: turma.cor }}
									/>
								</div>
							</Link>
						))}
					</div>
					{dados.semTurma > 0 && dados.porTurma.length > 0 && (
						<CardFooter>
							{dados.semTurma} inscrito{dados.semTurma > 1 ? "s" : ""} ainda sem
							turma ·{" "}
							<Link
								to="/inscritos"
								search={{ turma: "sem" }}
								className="text-accent hover:text-accent-hover"
							>
								distribuir
							</Link>
						</CardFooter>
					)}
				</Card>
			</div>
		</PageContainer>
	);
}

function Legenda({
	cor,
	borda,
	children,
}: {
	cor: string;
	borda?: boolean;
	children: React.ReactNode;
}) {
	return (
		<span className="inline-flex items-center gap-1.5">
			<span
				className="size-2.5 rounded-[3px]"
				style={{
					backgroundColor: cor,
					boxShadow: borda ? "inset 0 0 0 1px var(--color-line-strong)" : undefined,
				}}
				aria-hidden="true"
			/>
			{children}
		</span>
	);
}
