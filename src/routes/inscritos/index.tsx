import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Plus, Search, Upload, Users, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { WhatsAppButton } from "../../components/inscrito/WhatsAppButton";
import { PageContainer } from "../../components/layout/PageContainer";
import { TurmaTag } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Card } from "../../components/ui/Card";
import { controlClasses } from "../../components/ui/Input";
import { EmptyState, Segmented } from "../../components/ui/misc";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useDebounce } from "../../hooks/useDebounce";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";
import { Status } from "../../types/enums";
import { cn } from "../../utils/cn";
import { calcularIdade } from "../../utils/mascaras";
import { formatarTelefone, limparTelefone } from "../../utils/telefone";

interface InscritosSearch {
	q?: string;
	status?: Status;
	/** id da turma, ou "sem" para inscritos sem turma */
	turma?: string;
}

export const Route = createFileRoute("/inscritos/")({
	validateSearch: (search: Record<string, unknown>): InscritosSearch => ({
		q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
		status:
			search.status === Status.PENDENTE || search.status === Status.CONCLUIDO
				? search.status
				: undefined,
		turma:
			typeof search.turma === "string" && search.turma ? search.turma : undefined,
	}),
	component: InscritosPage,
});

type FiltroStatus = "todos" | Status;

function normalizar(texto: string): string {
	return texto
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.trim();
}

function InscritosPage() {
	const inscricoes = useInscricoesStore((s) => s.inscricoes);
	const exportarCSV = useInscricoesStore((s) => s.exportar);
	const turmas = useTurmasStore((s) => s.turmas);
	const { q, status, turma } = Route.useSearch();
	const navigate = Route.useNavigate();
	const turmaSelectId = useId();

	const [busca, setBusca] = useState(q ?? "");
	const buscaDebounced = useDebounce(busca, 300);

	// Mantém a busca na URL sem criar entradas no histórico a cada tecla
	useEffect(() => {
		const valor = buscaDebounced.trim() || undefined;
		navigate({
			search: (prev) => ({ ...prev, q: valor }),
			replace: true,
		});
	}, [buscaDebounced, navigate]);

	const turmaById = useMemo(
		() => new Map(turmas.map((t) => [t.id, t])),
		[turmas],
	);

	const porTurma = useMemo(() => {
		if (!turma) return inscricoes;
		if (turma === "sem") return inscricoes.filter((i) => !i.turmaId);
		return inscricoes.filter((i) => i.turmaId === turma);
	}, [inscricoes, turma]);

	const filtrados = useMemo(() => {
		const termo = normalizar(buscaDebounced);
		const digitos = limparTelefone(buscaDebounced);
		return porTurma
			.filter((i) => !status || i.status === status)
			.filter((i) => {
				if (!termo) return true;
				const c = i.crismando;
				return (
					normalizar(c.nome ?? "").includes(termo) ||
					normalizar(c.bairro ?? "").includes(termo) ||
					(digitos.length >= 3 && limparTelefone(c.celular).includes(digitos))
				);
			})
			.sort((a, b) =>
				(a.crismando.nome ?? "").localeCompare(b.crismando.nome ?? "", "pt-BR"),
			);
	}, [porTurma, status, buscaDebounced]);

	const totalPendentes = inscricoes.filter(
		(i) => i.status === Status.PENDENTE,
	).length;
	const pendentesNaTurma = porTurma.filter(
		(i) => i.status === Status.PENDENTE,
	).length;
	const concluidosNaTurma = porTurma.length - pendentesNaTurma;
	const temFiltro = !!(busca.trim() || status || turma);

	function limparFiltros() {
		setBusca("");
		navigate({ search: {}, replace: true });
	}

	const descricao =
		inscricoes.length === 0
			? "Nenhuma inscrição cadastrada"
			: `${inscricoes.length} ${inscricoes.length !== 1 ? "inscrições" : "inscrição"} · ${totalPendentes} pendente${totalPendentes !== 1 ? "s" : ""}`;

	return (
		<PageContainer
			title="Inscritos"
			description={descricao}
			actions={
				<>
					<Button
						variant="secondary"
						onClick={exportarCSV}
						disabled={inscricoes.length === 0}
					>
						<Download />
						Exportar CSV
					</Button>
					<ButtonLink to="/inscritos/novo">
						<Plus />
						Novo inscrito
					</ButtonLink>
				</>
			}
		>
			{inscricoes.length === 0 ? (
				<Card>
					<EmptyState
						icon={<Users />}
						title="Nenhum inscrito ainda"
						action={
							<div className="flex flex-wrap justify-center gap-2">
								<ButtonLink to="/" variant="secondary">
									<Upload />
									Importar CSV
								</ButtonLink>
								<ButtonLink to="/inscritos/novo">
									<Plus />
									Cadastrar inscrito
								</ButtonLink>
							</div>
						}
					>
						Importe a planilha de inscrições ou cadastre o primeiro inscrito
						manualmente.
					</EmptyState>
				</Card>
			) : (
				<>
					<div className="flex flex-wrap items-center gap-2.5">
						<div className="relative flex min-w-0 flex-[1_1_280px] items-center">
							<Search
								className="pointer-events-none absolute left-3 size-4 text-muted"
								aria-hidden="true"
							/>
							<input
								type="search"
								aria-label="Buscar inscrito"
								placeholder="Buscar por nome, telefone ou bairro"
								value={busca}
								onChange={(e) => setBusca(e.target.value)}
								className={cn(controlClasses, "h-11 pr-10 pl-9")}
							/>
							{busca && (
								<button
									type="button"
									onClick={() => setBusca("")}
									aria-label="Limpar busca"
									className="absolute right-1 flex size-9 items-center justify-center rounded-lg text-muted hover:text-ink"
								>
									<X className="size-4" />
								</button>
							)}
						</div>
						<Segmented<FiltroStatus>
							label="Filtrar por status"
							value={status ?? "todos"}
							onChange={(v) =>
								navigate({
									search: (prev) => ({
										...prev,
										status: v === "todos" ? undefined : v,
									}),
									replace: true,
								})
							}
							options={[
								{
									value: "todos",
									label: <>Todos <span className="text-muted">{porTurma.length}</span></>,
								},
								{
									value: Status.PENDENTE,
									label: <>Pendentes <span className="text-muted">{pendentesNaTurma}</span></>,
								},
								{
									value: Status.CONCLUIDO,
									label: <>Concluídos <span className="text-muted">{concluidosNaTurma}</span></>,
								},
							]}
						/>
						<div className="flex items-center gap-2">
							<label htmlFor={turmaSelectId} className="text-muted">
								Turma
							</label>
							<select
								id={turmaSelectId}
								value={turma ?? ""}
								onChange={(e) =>
									navigate({
										search: (prev) => ({
											...prev,
											turma: e.target.value || undefined,
										}),
										replace: true,
									})
								}
								className={cn(controlClasses, "h-11 w-auto max-w-56 pr-8")}
							>
								<option value="">Todas</option>
								{turmas.map((t) => (
									<option key={t.id} value={t.id}>
										{t.nome}
									</option>
								))}
								<option value="sem">Sem turma</option>
							</select>
						</div>
					</div>

					<Card className="overflow-hidden">
						{filtrados.length === 0 ? (
							<EmptyState
								icon={<Search />}
								title="Nenhum resultado encontrado"
								action={
									temFiltro && (
										<Button variant="secondary" onClick={limparFiltros}>
											<X />
											Limpar filtros
										</Button>
									)
								}
							>
								Nenhum inscrito corresponde à busca e aos filtros escolhidos.
							</EmptyState>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full min-w-[720px] border-collapse text-left">
									<thead>
										<tr className="text-xs text-muted">
											<th scope="col" className="px-5 py-3 font-medium">Nome</th>
											<th scope="col" className="px-3 py-3 font-medium">Turma</th>
											<th scope="col" className="px-3 py-3 font-medium">Contato</th>
											<th scope="col" className="w-44 px-3 py-3 font-medium">Ficha</th>
											<th scope="col" className="px-5 py-3 text-right font-medium">Ações</th>
										</tr>
									</thead>
									<tbody>
										{filtrados.map((inscricao) => {
											const c = inscricao.crismando;
											const nome = c.nome ?? "Nome não informado";
											const idade = calcularIdade(c.dataNascimento);
											const t = inscricao.turmaId
												? turmaById.get(inscricao.turmaId)
												: undefined;
											const detalhes = [
												idade !== null ? `${idade} anos` : "Idade não informada",
												c.bairro,
											]
												.filter(Boolean)
												.join(" · ");
											return (
												<tr
													key={inscricao.id}
													className="border-t border-line/80 transition-colors hover:bg-bg"
												>
													<td className="px-5 py-3">
														<Link
															to="/inscritos/$id"
															params={{ id: inscricao.id }}
															className={cn(
																"font-medium no-underline hover:text-accent",
																c.nome ? "text-ink" : "text-muted italic",
															)}
														>
															{nome}
														</Link>
														<div className="text-xs text-muted">{detalhes}</div>
													</td>
													<td className="px-3 py-3">
														{t ? (
															<TurmaTag nome={t.nome} cor={t.cor} />
														) : (
															<span className="text-[13px] text-muted">Sem turma</span>
														)}
													</td>
													<td className="px-3 py-3 whitespace-nowrap text-ink-2 tabular-nums">
														{formatarTelefone(c.celular) || (
															<span className="text-muted">—</span>
														)}
													</td>
													<td className="px-3 py-3">
														<ProgressBar
															value={inscricao.completude}
															label={`Ficha de ${nome}`}
														/>
													</td>
													<td className="px-5 py-3 text-right">
														<WhatsAppButton inscricao={inscricao} />
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
						<div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/80 px-5 py-3 text-[13px] text-muted">
							<span aria-live="polite">
								Mostrando {filtrados.length} de {inscricoes.length}
							</span>
							{temFiltro && filtrados.length > 0 && (
								<button
									type="button"
									onClick={limparFiltros}
									className="text-accent hover:text-accent-hover"
								>
									Limpar filtros
								</button>
							)}
						</div>
					</Card>
				</>
			)}
		</PageContainer>
	);
}
