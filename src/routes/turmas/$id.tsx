import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	FileDown,
	GraduationCap,
	Search,
	UserMinus,
	UserPlus,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { exportarTurmaPDF } from "../../features/inscricoes/services/pdfService";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";
import type { Inscricao } from "../../types/inscricao";
import { calcularIdade } from "../../utils/mascaras";

const FAIXAS = [
	{ label: "Menos de 14", min: 0, max: 13 },
	{ label: "14 – 17 anos", min: 14, max: 17 },
	{ label: "18 – 24 anos", min: 18, max: 24 },
	{ label: "25 – 35 anos", min: 25, max: 35 },
	{ label: "36 – 50 anos", min: 36, max: 50 },
	{ label: "Acima de 50", min: 51, max: 999 },
];

function FaixasEtarias({
	membros,
	cor,
}: { membros: Inscricao[]; cor: string }) {
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
}: {
	inscricao: Inscricao;
	acao: "remover" | "adicionar";
	labelAcao: string;
	corAcao: string;
	onAcao: (id: string) => void;
}) {
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
			<div>
				<p className="font-medium text-gray-900">{nome}</p>
				{info && <p className="text-xs text-gray-400">{info}</p>}
			</div>
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

	const [mostrarModal, setMostrarModal] = useState(false);
	const [busca, setBusca] = useState("");

	const turma = getTurma(id);

	const membros = useMemo(
		() => inscricoes.filter((i) => i.turmaId === id),
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
								/>
							))
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
		</>
	);
}
