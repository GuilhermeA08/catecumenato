import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Cake } from "lucide-react";
import { useMemo } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Badge, TurmaTag } from "../../components/ui/Badge";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { EmptyState, StatCard } from "../../components/ui/misc";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";
import type { Inscricao } from "../../types/inscricao";
import type { Turma } from "../../types/turma";
import { calcularIdade } from "../../utils/mascaras";

export const Route = createFileRoute("/inscritos/idades")({
	component: IdadesPage,
});

interface Faixa {
	label: string;
	min: number | null;
	max: number | null;
}

const FAIXAS: Faixa[] = [
	{ label: "Menores de 14 anos", min: null, max: 13 },
	{ label: "14 – 17 anos", min: 14, max: 17 },
	{ label: "18 – 24 anos", min: 18, max: 24 },
	{ label: "25 – 34 anos", min: 25, max: 34 },
	{ label: "35 – 49 anos", min: 35, max: 49 },
	{ label: "50 anos ou mais", min: 50, max: null },
];

function pertenceFaixa(idade: number, faixa: Faixa): boolean {
	if (faixa.min !== null && idade < faixa.min) return false;
	if (faixa.max !== null && idade > faixa.max) return false;
	return true;
}

type ComIdade = Inscricao & { idade: number | null };

function porNome(a: Inscricao, b: Inscricao) {
	return (a.crismando.nome ?? "").localeCompare(b.crismando.nome ?? "", "pt-BR");
}

function IdadesPage() {
	const inscricoes = useInscricoesStore((s) => s.inscricoes);
	const turmas = useTurmasStore((s) => s.turmas);

	const turmaById = useMemo(
		() => new Map(turmas.map((t) => [t.id, t])),
		[turmas],
	);

	const { grupos, semData, comData, media, maiorGrupo } = useMemo(() => {
		const todos: ComIdade[] = inscricoes.map((i) => ({
			...i,
			idade: calcularIdade(i.crismando.dataNascimento),
		}));
		const semData = todos.filter((i) => i.idade === null).sort(porNome);
		const idades = todos
			.map((i) => i.idade)
			.filter((i): i is number => i !== null);

		const grupos = FAIXAS.map((faixa) => ({
			faixa,
			inscritos: todos
				.filter((i) => i.idade !== null && pertenceFaixa(i.idade, faixa))
				.sort((a, b) => (a.idade as number) - (b.idade as number) || porNome(a, b)),
		}));

		return {
			grupos,
			semData,
			comData: idades.length,
			media:
				idades.length > 0
					? (idades.reduce((s, i) => s + i, 0) / idades.length)
							.toFixed(1)
							.replace(".", ",")
					: null,
			maiorGrupo: Math.max(0, ...grupos.map((g) => g.inscritos.length)),
		};
	}, [inscricoes]);

	const total = inscricoes.length;

	return (
		<PageContainer
			title="Faixas etárias"
			description={
				total > 0
					? `Distribuição dos ${total} inscritos por idade`
					: "Distribuição dos inscritos por idade"
			}
		>
			{total === 0 ? (
				<Card>
					<EmptyState
						icon={<Cake />}
						title="Nenhum inscrito ainda"
						action={<ButtonLink to="/">Importar inscrições</ButtonLink>}
					>
						Importe ou cadastre inscritos para ver a distribuição por idade.
					</EmptyState>
				</Card>
			) : (
				<>
					<section
						aria-label="Resumo"
						className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3"
					>
						<StatCard label="Inscritos" value={total} hint="no total" />
						<StatCard
							label="Com data de nascimento"
							value={comData}
							dot="var(--color-ok)"
							hint={`${Math.round((comData / total) * 100)}% dos inscritos`}
						/>
						<StatCard
							label="Sem data de nascimento"
							value={semData.length}
							dot={semData.length > 0 ? "var(--color-warn)" : undefined}
							hint={
								semData.length > 0 ? (
									<a href="#sem-data" className="text-accent hover:text-accent-hover">
										Ver lista para completar
									</a>
								) : (
									"Todas as fichas têm a data"
								)
							}
						/>
						<StatCard
							label="Idade média"
							value={media ?? "—"}
							hint={media ? "anos" : "Sem datas informadas"}
						/>
					</section>

					<Card>
						<CardHeader
							title="Distribuição"
							description="Quantidade de inscritos em cada faixa de idade"
						/>
						<CardContent>
							<ul className="m-0 flex list-none flex-col gap-3 p-0">
								{grupos.map(({ faixa, inscritos }) => {
									const n = inscritos.length;
									const largura = maiorGrupo ? (n / maiorGrupo) * 100 : 0;
									return (
										<li
											key={faixa.label}
											className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3"
										>
											<span className="truncate text-[13px] text-ink-2">
												{faixa.label}
											</span>
											<div className="h-2.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
												<div
													className="h-full rounded-full bg-accent"
													style={{ width: `${largura}%` }}
												/>
											</div>
											<span className="w-16 text-right text-[13px] text-muted tabular-nums">
												{n} · {comData ? Math.round((n / comData) * 100) : 0}%
											</span>
										</li>
									);
								})}
							</ul>
						</CardContent>
					</Card>

					{semData.length > 0 && (
						<Card id="sem-data" className="scroll-mt-6 overflow-hidden">
							<CardHeader
								title={
									<span className="flex items-center gap-2">
										<AlertTriangle className="size-5 text-warn" aria-hidden="true" />
										Sem data de nascimento
									</span>
								}
								description="Abra a ficha de cada inscrito para informar a data."
								actions={<Badge tone="warn">{semData.length}</Badge>}
							/>
							<ListaInscritos inscritos={semData} turmaById={turmaById} semData />
						</Card>
					)}

					{grupos
						.filter((g) => g.inscritos.length > 0)
						.map(({ faixa, inscritos }) => (
							<Card key={faixa.label} className="overflow-hidden">
								<CardHeader
									title={faixa.label}
									actions={
										<Badge>
											{inscritos.length} inscrito{inscritos.length !== 1 ? "s" : ""}
										</Badge>
									}
								/>
								<ListaInscritos inscritos={inscritos} turmaById={turmaById} />
							</Card>
						))}
				</>
			)}
		</PageContainer>
	);
}

function ListaInscritos({
	inscritos,
	turmaById,
	semData,
}: {
	inscritos: ComIdade[];
	turmaById: Map<string, Turma>;
	semData?: boolean;
}) {
	return (
		<ul className="m-0 grid list-none p-0 sm:grid-cols-2 lg:grid-cols-3">
			{inscritos.map((inscrito) => {
				const turma = inscrito.turmaId ? turmaById.get(inscrito.turmaId) : undefined;
				return (
					<li key={inscrito.id} className="border-t border-line/80">
						<Link
							to="/inscritos/$id"
							params={{ id: inscrito.id }}
							className="group flex min-h-14 items-center justify-between gap-3 px-5 py-2.5 text-ink no-underline transition-colors hover:bg-bg sm:px-6"
						>
							<span className="min-w-0">
								<span
									className={
										inscrito.crismando.nome
											? "block truncate font-medium group-hover:text-accent"
											: "block truncate font-medium text-muted italic group-hover:text-accent"
									}
								>
									{inscrito.crismando.nome ?? "Nome não informado"}
								</span>
								{turma ? (
									<TurmaTag nome={turma.nome} cor={turma.cor} className="text-xs" />
								) : (
									<span className="text-xs text-muted">Sem turma</span>
								)}
							</span>
							<span className="shrink-0 text-[13px] text-muted tabular-nums">
								{semData ? (
									<span className="text-accent group-hover:text-accent-hover">
										Completar ficha
									</span>
								) : (
									`${inscrito.idade} anos`
								)}
							</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
