import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	CalendarDays,
	ChevronDown,
	ChevronUp,
	ClipboardCheck,
	FileDown,
	GraduationCap,
	PlusCircle,
	Search,
	Trash2,
	UserMinus,
	UserPlus,
	X,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { PresencaBadge } from "../../components/encontro/PresencaBadge";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { exportarTurmaPDF } from "../../features/inscricoes/services/pdfService";
import { useEncontrosStore } from "../../stores/encontrosStore";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { usePresencasStore } from "../../stores/presencasStore";
import { useTurmasStore } from "../../stores/turmasStore";
import type { EncontroFormData } from "../../types/encontro";
import { StatusPresenca } from "../../types/enums";
import type { Inscricao } from "../../types/inscricao";
import { calcularIdade } from "../../utils/mascaras";
import {
	calcularPercentualFrequencia,
	resumirStatusPresencas,
} from "../../utils/presenca";

const FAIXAS = [
	{ label: "Menos de 14", min: 0, max: 13 },
	{ label: "14 – 17 anos", min: 14, max: 17 },
	{ label: "18 – 24 anos", min: 18, max: 24 },
	{ label: "25 – 35 anos", min: 25, max: 35 },
	{ label: "36 – 50 anos", min: 36, max: 50 },
	{ label: "Acima de 50", min: 51, max: 999 },
];

const OPCOES_STATUS_PRESENCA: Array<{
	value: StatusPresenca;
	label: string;
}> = [
	{ value: StatusPresenca.PENDENTE, label: "Pendente" },
	{ value: StatusPresenca.PRESENTE, label: "Presente" },
	{ value: StatusPresenca.AUSENTE, label: "Ausente" },
	{ value: StatusPresenca.FALTA_JUSTIFICADA, label: "Falta justificada" },
];

function formatarDataPtBr(dataIso: string): string {
	const data = new Date(`${dataIso}T00:00:00`);
	return data.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function FaixasEtarias({
	membros,
	cor,
}: {
	membros: Inscricao[];
	cor: string;
}) {
	const grupos = useMemo(() => {
		const semIdade = membros.filter(
			(m) => calcularIdade(m.crismando.dataNascimento) === null,
		).length;
		const faixas = FAIXAS.map((f) => ({
			...f,
			count: membros.filter((m) => {
				const idade = calcularIdade(m.crismando.dataNascimento);
				return idade !== null && idade >= f.min && idade <= f.max;
			}).length,
		}));
		return { faixas, semIdade };
	}, [membros]);

	const total = membros.length;
	const comIdade = total - grupos.semIdade;

	if (total === 0) return null;

	return (
		<div className="mb-6 rounded-xl border border-gray-200 bg-white">
			<div className="border-b border-gray-100 px-5 py-4">
				<h2 className="font-semibold text-gray-900">Distribuição por idade</h2>
				{grupos.semIdade > 0 && (
					<p className="text-xs text-gray-400 mt-0.5">
						{grupos.semIdade} membro(s) sem data de nascimento
					</p>
				)}
			</div>
			<div className="p-5 space-y-3">
				{grupos.faixas.map((f) => {
					const pct = comIdade > 0 ? (f.count / comIdade) * 100 : 0;
					return (
						<div key={f.label}>
							<div className="flex items-center justify-between mb-1">
								<span className="text-sm text-gray-700">{f.label}</span>
								<span className="text-sm font-semibold text-gray-900">
									{f.count}
									<span className="text-xs font-normal text-gray-400 ml-1">
										{f.count > 0 ? `(${Math.round(pct)}%)` : ""}
									</span>
								</span>
							</div>
							<div className="h-2 w-full rounded-full bg-gray-100">
								<div
									className="h-2 rounded-full transition-all duration-500"
									style={{
										width: `${pct}%`,
										backgroundColor: cor,
										opacity: f.count === 0 ? 0 : 1,
									}}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/turmas/$id")({
	component: TurmaDetalhePage,
});

function InscritoRow({
	inscricao,
	acao,
	labelAcao,
	corAcao,
	onAcao,
	mostrarSelectTurma,
	linhaClicavel,
}: {
	inscricao: Inscricao;
	acao: "remover" | "adicionar";
	labelAcao: string;
	corAcao: string;
	onAcao: (id: string) => void;
	mostrarSelectTurma?: boolean;
	linhaClicavel?: boolean;
}) {
	const navigate = Route.useNavigate();
	const { turmas } = useTurmasStore();
	const { vincularTurma } = useInscricoesStore();

	const nome = inscricao.crismando.nome ?? "(sem nome)";
	const idade = calcularIdade(inscricao.crismando.dataNascimento);
	const dia = inscricao.crismando.diaEncontro;
	const horario = inscricao.crismando.horario;

	const info = [
		idade !== null ? `${idade} anos` : null,
		[dia, horario].filter(Boolean).join(" – ") || null,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50">
			{linhaClicavel ? (
				<button
					type="button"
					onClick={() =>
						navigate({ to: "/inscritos/$id", params: { id: inscricao.id } })
					}
					className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
					aria-label={`Abrir ficha de ${nome}`}
				>
					<p className="font-medium text-gray-900">{nome}</p>
					{info && <p className="text-xs text-gray-400">{info}</p>}
				</button>
			) : (
				<div className="min-w-0 flex-1">
					<p className="font-medium text-gray-900">{nome}</p>
					{info && <p className="text-xs text-gray-400">{info}</p>}
				</div>
			)}
			<div className="flex items-center gap-2">
				{mostrarSelectTurma && (
					<select
						value={inscricao.turmaId || ""}
						onChange={(e) =>
							vincularTurma(inscricao.id, e.target.value || null)
						}
						className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						title="Trocar de turma"
					>
						<option value="">Sem turma</option>
						{turmas.map((t) => (
							<option key={t.id} value={t.id}>
								{t.nome}
							</option>
						))}
					</select>
				)}
				<button
					type="button"
					onClick={() => onAcao(inscricao.id)}
					className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${corAcao}`}
					title={labelAcao}
				>
					{acao === "remover" ? (
						<UserMinus className="h-3.5 w-3.5" />
					) : (
						<UserPlus className="h-3.5 w-3.5" />
					)}
					{labelAcao}
				</button>
			</div>
		</div>
	);
}

function ModalAdicionarInscritos({
	turmaId,
	disponíveis,
	onFechar,
}: {
	turmaId: string;
	disponíveis: Inscricao[];
	onFechar: () => void;
}) {
	const { vincularTurma } = useInscricoesStore();
	const [busca, setBusca] = useState("");

	const filtrados = useMemo(() => {
		const q = busca.toLowerCase();
		if (!q) return disponíveis;
		return disponíveis.filter((i) =>
			(i.crismando.nome ?? "").toLowerCase().includes(q),
		);
	}, [disponíveis, busca]);

	function handleAdicionar(id: string) {
		vincularTurma(id, turmaId);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div
				className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl"
				style={{ maxHeight: "80vh" }}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-gray-100 p-5">
					<div>
						<h2 className="text-lg font-semibold text-gray-900">
							Adicionar inscritos
						</h2>
						<p className="text-sm text-gray-500">
							{disponíveis.length} disponível(is)
						</p>
					</div>
					<button
						type="button"
						onClick={onFechar}
						className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Busca */}
				<div className="border-b border-gray-100 p-4">
					<div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
						<Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
						<input
							type="text"
							value={busca}
							onChange={(e) => setBusca(e.target.value)}
							placeholder="Buscar por nome..."
							className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
						/>
					</div>
				</div>

				{/* Lista */}
				<div className="flex-1 overflow-y-auto p-2">
					{filtrados.length === 0 ? (
						<p className="py-8 text-center text-sm text-gray-400">
							{busca
								? "Nenhum inscrito encontrado"
								: "Todos os inscritos já estão em turmas"}
						</p>
					) : (
						filtrados.map((i) => (
							<InscritoRow
								key={i.id}
								inscricao={i}
								acao="adicionar"
								labelAcao="Adicionar"
								corAcao="bg-blue-50 text-blue-700 hover:bg-blue-100"
								onAcao={handleAdicionar}
							/>
						))
					)}
				</div>

				<div className="border-t border-gray-100 p-4">
					<Button variant="secondary" onClick={onFechar} className="w-full">
						Fechar
					</Button>
				</div>
			</div>
		</div>
	);
}

function TurmaDetalhePage() {
	const { id } = Route.useParams();
	const { getById: getTurma } = useTurmasStore();
	const { inscricoes, vincularTurma } = useInscricoesStore();
	const { encontros, criarEncontro, excluirEncontro } = useEncontrosStore();
	const { getByEncontro, definirStatus, getByInscrito } = usePresencasStore();

	const [mostrarModal, setMostrarModal] = useState(false);
	const [busca, setBusca] = useState("");
	const [mostrarModalEncontro, setMostrarModalEncontro] = useState(false);
	const encontroDataId = useId();
	const encontroInicioId = useId();
	const encontroFimId = useId();
	const encontroLocalId = useId();
	const encontroObsId = useId();
	const [encontroExpandidoId, setEncontroExpandidoId] = useState<string | null>(
		null,
	);
	const [formEncontro, setFormEncontro] = useState<
		Pick<
			EncontroFormData,
			"dataEncontro" | "horarioInicio" | "horarioFim" | "local" | "observacoes"
		>
	>({
		dataEncontro: "",
		horarioInicio: "",
		horarioFim: null,
		local: null,
		observacoes: null,
	});

	const turma = getTurma(id);

	const membros = useMemo(
		() =>
			inscricoes
				.filter((i) => i.turmaId === id)
				.sort((a, b) => {
					const nomeA = a.crismando.nome ?? "";
					const nomeB = b.crismando.nome ?? "";
					return nomeA.localeCompare(nomeB, "pt-BR", { sensitivity: "base" });
				}),
		[inscricoes, id],
	);

	const disponíveis = useMemo(
		() => inscricoes.filter((i) => !i.turmaId),
		[inscricoes],
	);

	const membrosFiltrados = useMemo(() => {
		const q = busca.toLowerCase();
		if (!q) return membros;
		return membros.filter((i) =>
			(i.crismando.nome ?? "").toLowerCase().includes(q),
		);
	}, [membros, busca]);

	const encontrosDaTurma = useMemo(
		() =>
			encontros
				.filter((e) => e.turmaId === id)
				.sort((a, b) => {
					const aKey = `${a.dataEncontro} ${a.horarioInicio}`;
					const bKey = `${b.dataEncontro} ${b.horarioInicio}`;
					return bKey.localeCompare(aKey, "pt-BR", { sensitivity: "base" });
				}),
		[encontros, id],
	);

	const frequenciaPorMembro = useMemo(() => {
		return membros.map((membro) => {
			const presencasDoMembro = getByInscrito(membro.id).filter((p) =>
				encontrosDaTurma.some((e) => e.id === p.encontroId),
			);
			const percentual = calcularPercentualFrequencia(presencasDoMembro, true);
			const resumo = resumirStatusPresencas(presencasDoMembro);

			return {
				inscrito: membro,
				percentual,
				resumo,
			};
		});
	}, [membros, getByInscrito, encontrosDaTurma]);

	function handleCriarEncontro() {
		if (!formEncontro.dataEncontro || !formEncontro.horarioInicio) return;

		criarEncontro({
			turmaId: id,
			dataEncontro: formEncontro.dataEncontro,
			horarioInicio: formEncontro.horarioInicio,
			horarioFim: formEncontro.horarioFim,
			local: formEncontro.local,
			observacoes: formEncontro.observacoes,
		});

		setFormEncontro({
			dataEncontro: "",
			horarioInicio: "",
			horarioFim: null,
			local: null,
			observacoes: null,
		});
		setMostrarModalEncontro(false);
	}

	if (!turma) {
		return (
			<PageContainer title="Turma não encontrada" description="">
				<div className="py-12 text-center">
					<p className="text-gray-500">
						Esta turma não existe ou foi excluída.
					</p>
					<Link
						to="/turmas"
						className="mt-4 inline-block text-blue-600 hover:underline"
					>
						← Voltar para turmas
					</Link>
				</div>
			</PageContainer>
		);
	}

	return (
		<>
			<PageContainer
				title={turma.nome}
				description={turma.descricao ?? ""}
				actions={
					<div className="flex items-center gap-2">
						{membros.length > 0 && (
							<Button
								variant="secondary"
								size="sm"
								onClick={() => exportarTurmaPDF(turma, membros)}
								title="Exportar lista em PDF"
							>
								<FileDown className="h-4 w-4" />
								Exportar PDF
							</Button>
						)}
						<Link to="/turmas">
							<Button variant="secondary" size="sm">
								<ArrowLeft className="h-4 w-4" />
								Turmas
							</Button>
						</Link>
					</div>
				}
			>
				{/* Info da turma */}
				<div
					className="mb-6 flex items-center gap-4 rounded-xl p-4"
					style={{
						backgroundColor: turma.cor + "14",
						border: `1.5px solid ${turma.cor}44`,
					}}
				>
					<div
						className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
						style={{
							backgroundColor: turma.cor + "22",
							border: `2px solid ${turma.cor}`,
						}}
					>
						<GraduationCap className="h-6 w-6" style={{ color: turma.cor }} />
					</div>
					<div className="flex-1">
						<p className="font-semibold text-gray-900">{turma.nome}</p>
						{turma.descricao && (
							<p className="text-sm text-gray-500">{turma.descricao}</p>
						)}
					</div>
					<div className="text-right">
						<p className="text-2xl font-bold" style={{ color: turma.cor }}>
							{membros.length}
						</p>
						<p className="text-xs text-gray-500">
							{membros.length === 1 ? "membro" : "membros"}
						</p>
					</div>
				</div>

				{/* Distribuição por faixa etária */}
				<FaixasEtarias membros={membros} cor={turma.cor} />

				{/* Membros */}
				<div className="rounded-xl border border-gray-200 bg-white">
					<div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
						<h2 className="font-semibold text-gray-900">Membros da turma</h2>
						<div className="flex items-center gap-2">
							{membros.length > 0 && (
								<div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
									<Search className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
									<input
										type="text"
										value={busca}
										onChange={(e) => setBusca(e.target.value)}
										placeholder="Filtrar..."
										className="w-32 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
									/>
								</div>
							)}
							<Button
								size="sm"
								onClick={() => setMostrarModal(true)}
								disabled={disponíveis.length === 0}
								title={
									disponíveis.length === 0
										? "Todos os inscritos já estão em turmas"
										: undefined
								}
							>
								<UserPlus className="h-4 w-4" />
								Adicionar
							</Button>
						</div>
					</div>

					<div className="p-2">
						{membros.length === 0 ? (
							<div className="py-12 text-center">
								<GraduationCap className="mx-auto mb-3 h-10 w-10 text-gray-200" />
								<p className="text-sm text-gray-400">
									Nenhum inscrito nesta turma ainda
								</p>
								{disponíveis.length > 0 && (
									<Button
										onClick={() => setMostrarModal(true)}
										className="mt-4"
										size="sm"
									>
										<UserPlus className="h-4 w-4" />
										Adicionar inscritos
									</Button>
								)}
							</div>
						) : membrosFiltrados.length === 0 ? (
							<p className="py-8 text-center text-sm text-gray-400">
								Nenhum membro encontrado para "{busca}"
							</p>
						) : (
							membrosFiltrados.map((inscricao) => (
								<InscritoRow
									key={inscricao.id}
									inscricao={inscricao}
									acao="remover"
									labelAcao="Remover"
									corAcao="bg-red-50 text-red-600 hover:bg-red-100"
									onAcao={(inscritoId) => vincularTurma(inscritoId, null)}
									mostrarSelectTurma
									linhaClicavel
								/>
							))
						)}
					</div>
				</div>

				{/* Encontros */}
				<div className="mt-6 rounded-xl border border-gray-200 bg-white">
					<div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
						<div>
							<h2 className="font-semibold text-gray-900">
								Encontros da turma
							</h2>
							<p className="text-xs text-gray-500 mt-0.5">
								Crie encontros e registre presenca dos membros
							</p>
						</div>
						<Button size="sm" onClick={() => setMostrarModalEncontro(true)}>
							<PlusCircle className="h-4 w-4" />
							Novo encontro
						</Button>
					</div>

					<div className="p-2">
						{encontrosDaTurma.length === 0 ? (
							<div className="py-10 text-center">
								<CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-200" />
								<p className="text-sm text-gray-400">
									Nenhum encontro cadastrado para esta turma
								</p>
							</div>
						) : (
							encontrosDaTurma.map((encontro) => {
								const presencasDoEncontro = getByEncontro(encontro.id);
								const resumo = resumirStatusPresencas(presencasDoEncontro);
								const chamadaAberta = encontroExpandidoId === encontro.id;

								return (
									<div
										key={encontro.id}
										className="mb-2 overflow-hidden rounded-xl border border-gray-100"
									>
										<div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50">
											<div>
												<p className="font-medium text-gray-900">
													{formatarDataPtBr(encontro.dataEncontro)} -{" "}
													{encontro.horarioInicio}
													{encontro.horarioFim
														? ` as ${encontro.horarioFim}`
														: ""}
												</p>
												<p className="text-xs text-gray-500">
													{encontro.local || "Local nao informado"}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
													P {resumo.presente}
												</span>
												<span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
													A {resumo.ausente}
												</span>
												<span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
													Pen {resumo.pendente}
												</span>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setEncontroExpandidoId((atual) =>
															atual === encontro.id ? null : encontro.id,
														)
													}
												>
													<ClipboardCheck className="h-4 w-4" />
													Chamada
													{chamadaAberta ? (
														<ChevronUp className="h-4 w-4" />
													) : (
														<ChevronDown className="h-4 w-4" />
													)}
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														if (
															confirm("Excluir este encontro e suas presencas?")
														) {
															excluirEncontro(encontro.id);
														}
													}}
													className="text-red-500 hover:text-red-600"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>

										{chamadaAberta && (
											<div className="border-t border-gray-100 p-3">
												{membros.length === 0 ? (
													<p className="text-sm text-gray-400 py-3 text-center">
														Turma sem membros para registrar presenca
													</p>
												) : (
													<div className="space-y-2">
														{membros.map((membro) => {
															const presencaAtual = presencasDoEncontro.find(
																(p) => p.inscritoId === membro.id,
															);
															const statusAtual =
																presencaAtual?.status ??
																StatusPresenca.PENDENTE;

															return (
																<div
																	key={membro.id}
																	className="flex flex-col gap-2 rounded-lg border border-gray-100 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
																>
																	<div className="min-w-0">
																		<p className="truncate text-sm font-medium text-gray-900">
																			{membro.crismando.nome ?? "(sem nome)"}
																		</p>
																		<PresencaBadge
																			status={statusAtual}
																			size="sm"
																		/>
																	</div>
																	<div className="flex items-center gap-2">
																		<select
																			value={statusAtual}
																			onChange={(e) =>
																				definirStatus(
																					encontro.id,
																					membro.id,
																					e.target.value as StatusPresenca,
																				)
																			}
																			className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
																		>
																			{OPCOES_STATUS_PRESENCA.map((opcao) => (
																				<option
																					key={opcao.value}
																					value={opcao.value}
																				>
																					{opcao.label}
																				</option>
																			))}
																		</select>
																	</div>
																</div>
															);
														})}
													</div>
												)}
											</div>
										)}
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* Frequencia da turma */}
				<div className="mt-6 rounded-xl border border-gray-200 bg-white">
					<div className="border-b border-gray-100 px-5 py-4">
						<h2 className="font-semibold text-gray-900">
							Frequencia por membro
						</h2>
					</div>
					<div className="p-3">
						{frequenciaPorMembro.length === 0 ? (
							<p className="py-8 text-center text-sm text-gray-400">
								Sem membros para calcular frequencia
							</p>
						) : (
							<div className="space-y-2">
								{frequenciaPorMembro.map(({ inscrito, percentual, resumo }) => (
									<div
										key={inscrito.id}
										className="flex flex-col gap-2 rounded-lg border border-gray-100 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-medium text-gray-900">
												{inscrito.crismando.nome ?? "(sem nome)"}
											</p>
											<p className="text-xs text-gray-500">
												{resumo.presente} presencas · {resumo.ausente} ausencias
												· {resumo.faltaJustificada} justificadas
											</p>
										</div>
										<div className="text-right">
											<p className="text-lg font-semibold text-gray-900">
												{percentual}%
											</p>
											<p className="text-xs text-gray-500">de frequencia</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Inscritos sem turma hint */}
				{disponíveis.length > 0 && membros.length > 0 && (
					<p className="mt-4 text-center text-sm text-gray-400">
						{disponíveis.length} inscrito(s) ainda sem turma.{" "}
						<button
							type="button"
							onClick={() => setMostrarModal(true)}
							className="text-blue-600 hover:underline"
						>
							Adicionar à esta turma
						</button>
					</p>
				)}
			</PageContainer>

			{mostrarModal && (
				<ModalAdicionarInscritos
					turmaId={id}
					disponíveis={disponíveis}
					onFechar={() => setMostrarModal(false)}
				/>
			)}

			{mostrarModalEncontro && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-900">
								Novo encontro
							</h2>
							<button
								type="button"
								onClick={() => setMostrarModalEncontro(false)}
								className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className="sm:col-span-1">
								<label
									htmlFor={encontroDataId}
									className="mb-1 block text-sm font-medium text-gray-700"
								>
									Data
								</label>
								<input
									id={encontroDataId}
									type="date"
									value={formEncontro.dataEncontro}
									onChange={(e) =>
										setFormEncontro((atual) => ({
											...atual,
											dataEncontro: e.target.value,
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								/>
							</div>
							<div className="sm:col-span-1">
								<label
									htmlFor={encontroInicioId}
									className="mb-1 block text-sm font-medium text-gray-700"
								>
									Inicio
								</label>
								<input
									id={encontroInicioId}
									type="time"
									value={formEncontro.horarioInicio}
									onChange={(e) =>
										setFormEncontro((atual) => ({
											...atual,
											horarioInicio: e.target.value,
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								/>
							</div>
							<div className="sm:col-span-1">
								<label
									htmlFor={encontroFimId}
									className="mb-1 block text-sm font-medium text-gray-700"
								>
									Fim (opcional)
								</label>
								<input
									id={encontroFimId}
									type="time"
									value={formEncontro.horarioFim ?? ""}
									onChange={(e) =>
										setFormEncontro((atual) => ({
											...atual,
											horarioFim: e.target.value || null,
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								/>
							</div>
							<div className="sm:col-span-1">
								<label
									htmlFor={encontroLocalId}
									className="mb-1 block text-sm font-medium text-gray-700"
								>
									Local (opcional)
								</label>
								<input
									id={encontroLocalId}
									type="text"
									value={formEncontro.local ?? ""}
									onChange={(e) =>
										setFormEncontro((atual) => ({
											...atual,
											local: e.target.value || null,
										}))
									}
									placeholder="Sala, salao, capela..."
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								/>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor={encontroObsId}
									className="mb-1 block text-sm font-medium text-gray-700"
								>
									Observacoes (opcional)
								</label>
								<textarea
									id={encontroObsId}
									value={formEncontro.observacoes ?? ""}
									onChange={(e) =>
										setFormEncontro((atual) => ({
											...atual,
											observacoes: e.target.value || null,
										}))
									}
									rows={3}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								/>
							</div>
						</div>

						<div className="mt-5 flex justify-end gap-2">
							<Button
								variant="secondary"
								onClick={() => setMostrarModalEncontro(false)}
							>
								Cancelar
							</Button>
							<Button
								onClick={handleCriarEncontro}
								disabled={
									!formEncontro.dataEncontro || !formEncontro.horarioInicio
								}
							>
								Criar encontro
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
