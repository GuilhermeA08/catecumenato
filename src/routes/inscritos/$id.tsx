import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertTriangle,
	ArrowLeft,
	Check,
	Copy,
	Edit3,
	GraduationCap,
	Save,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CampoComCopia } from "../../components/inscrito/CampoComCopia";
import { SecaoDados } from "../../components/inscrito/SecaoDados";
import { StatusBadge } from "../../components/inscrito/StatusBadge";
import { WhatsAppButton } from "../../components/inscrito/WhatsAppButton";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Select } from "../../components/ui/Select";
import { CAMPOS_OBRIGATORIOS } from "../../constants/camposObrigatorios";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";
import { EstadoCivil, Sexo, Status } from "../../types/enums";
import type {
	ControleAdministrativo,
	DadosCrismando,
	DadosPadrinhoMadrinha,
	DadosPessoa,
	Inscricao,
} from "../../types/inscricao";
import { copiarParaClipboard } from "../../utils/clipboard";
import { obterValor, temValor } from "../../utils/completude";
import { mascaraTelefone } from "../../utils/mascaras";

export const Route = createFileRoute("/inscritos/$id")({
	component: InscritoPage,
});

const OPCOES_ESTADO_CIVIL = Object.values(EstadoCivil).map((v) => ({
	value: v,
	label: v,
}));
const OPCOES_SEXO = Object.values(Sexo).map((v) => ({ value: v, label: v }));
const OPCOES_SIM_NAO = [
	{ value: "true", label: "Sim" },
	{ value: "false", label: "Não" },
];

// Conta campos faltantes em uma seção
function contarFaltantesPorSecao(inscricao: Inscricao, secao: string): number {
	return CAMPOS_OBRIGATORIOS.filter((campo) => {
		if (campo.secao !== secao) return false;
		if (campo.condicao && !campo.condicao(inscricao)) return false;
		return !temValor(obterValor(inscricao, campo.path));
	}).length;
}

function InscritoPage() {
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const {
		getById,
		atualizarInscricao,
		alterarStatus,
		excluirInscricao,
		vincularTurma,
		carregado,
	} = useInscricoesStore();
	const { turmas } = useTurmasStore();
	const [editando, setEditando] = useState(false);
	const [copiouTudo, setCopiouTudo] = useState(false);

	const inscricao = getById(id);

	useEffect(() => {
		if (!carregado) navigate({ to: "/" });
	}, [carregado, navigate]);

	useEffect(() => {
		if (carregado && !inscricao) navigate({ to: "/inscritos" });
	}, [inscricao, carregado, navigate]);

	if (!inscricao) return null;

	async function handleCopiarTudo() {
		if (!inscricao) return;
		const linhas = [
			`Nome: ${inscricao.crismando.nome ?? "—"}`,
			`Celular: ${inscricao.crismando.celular ?? "—"}`,
			`Data de Nascimento: ${inscricao.crismando.dataNascimento ?? "—"}`,
			`Endereço: ${inscricao.crismando.endereco ?? "—"}`,
			`Bairro: ${inscricao.crismando.bairro ?? "—"}`,
			`Município: ${inscricao.crismando.municipio ?? "—"}`,
			`Pai: ${inscricao.pai.nome ?? "—"}`,
			`Mãe: ${inscricao.mae.nome ?? "—"}`,
		];
		await copiarParaClipboard(linhas.join("\n"));
		setCopiouTudo(true);
		setTimeout(() => setCopiouTudo(false), 2000);
	}

	return (
		<PageContainer>
			{/* Navegação */}
			<div className="mb-5">
				<Link
					to="/inscritos"
					className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
				>
					<ArrowLeft className="h-4 w-4" />
					Voltar para lista
				</Link>
			</div>

			{/* Header do inscrito */}
			<div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex-1 min-w-0">
						<div className="mb-1 flex flex-wrap items-center gap-2">
							<h1 className="text-xl font-bold text-gray-900 truncate">
								{inscricao.crismando.nome ?? "Nome não informado"}
							</h1>
							<StatusBadge status={inscricao.status} />
						</div>
						<p className="text-sm text-gray-500">
							{inscricao.crismando.municipio ?? ""}
							{inscricao.crismando.municipio && inscricao.crismando.celular
								? " · "
								: ""}
							{inscricao.crismando.celular ?? ""}
						</p>

						{/* Seletor de turma */}
						<div className="mt-3 flex items-center gap-2">
							<GraduationCap className="h-4 w-4 shrink-0 text-gray-400" />
							<select
								value={inscricao.turmaId ?? ""}
								onChange={(e) =>
									vincularTurma(id, e.target.value || null)
								}
								className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
							>
								<option value="">Sem turma</option>
								{turmas.map((t) => (
									<option key={t.id} value={t.id}>
										{t.nome}
									</option>
								))}
							</select>
							{inscricao.turmaId && (() => {
								const t = turmas.find(t => t.id === inscricao.turmaId);
								return t ? (
									<span
										className="h-3 w-3 rounded-full shrink-0"
										style={{ backgroundColor: t.cor }}
									/>
								) : null;
							})()}
						</div>

						<div className="mt-3">
							<ProgressBar value={inscricao.completude} />
						</div>
						{inscricao.camposFaltantes.length > 0 && (
							<div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
								<AlertTriangle className="h-3.5 w-3.5" />
								{inscricao.camposFaltantes.length} campo
								{inscricao.camposFaltantes.length > 1 ? "s" : ""} obrigatório
								{inscricao.camposFaltantes.length > 1 ? "s" : ""} faltando
							</div>
						)}
					</div>

					{/* Ações */}
					<div className="flex flex-wrap gap-2">
						{" "}
						<Button
							variant="ghost"
							onClick={() => {
								if (
									confirm(
										`Deseja excluir permanentemente "${inscricao.crismando.nome ?? "este inscrito"}"? Esta ação não pode ser desfeita.`,
									)
								) {
									excluirInscricao(id);
									navigate({ to: "/inscritos" });
								}
							}}
							className="text-red-500 hover:text-red-600"
							title="Excluir inscrito"
						>
							<Trash2 className="h-4 w-4" />
						</Button>{" "}
						<WhatsAppButton inscricao={inscricao} />
						<Button variant="secondary" onClick={handleCopiarTudo}>
							{copiouTudo ? (
								<Check className="h-4 w-4 text-green-600" />
							) : (
								<Copy className="h-4 w-4" />
							)}
							{copiouTudo ? "Copiado!" : "Copiar tudo"}
						</Button>
						<Button
							variant={editando ? "secondary" : "primary"}
							onClick={() => setEditando((e) => !e)}
						>
							{editando ? (
								<>
									<X className="h-4 w-4" /> Cancelar
								</>
							) : (
								<>
									<Edit3 className="h-4 w-4" /> Editar
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Toggle override de status */}
				{inscricao.statusOverride && (
					<div className="mt-3 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
						<AlertTriangle className="h-3.5 w-3.5" />
						Status definido manualmente.
						<button
							type="button"
							className="underline hover:no-underline"
							onClick={() => alterarStatus(id, Status.PENDENTE, false)}
						>
							Resetar para automático
						</button>
					</div>
				)}

				<div className="mt-3 flex items-center gap-2">
					<span className="text-xs text-gray-400">Forçar status:</span>
					<button
						type="button"
						onClick={() => alterarStatus(id, Status.CONCLUIDO, true)}
						className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${inscricao.status === Status.CONCLUIDO ? "border-green-400 bg-green-100 text-green-800" : "border-gray-200 text-gray-500 hover:border-green-300"}`}
					>
						✓ Concluído
					</button>
					<button
						type="button"
						onClick={() => alterarStatus(id, Status.PENDENTE, true)}
						className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${inscricao.status === Status.PENDENTE ? "border-yellow-400 bg-yellow-100 text-yellow-800" : "border-gray-200 text-gray-500 hover:border-yellow-300"}`}
					>
						⏳ Pendente
					</button>
				</div>
			</div>

			{/* Seções */}
			{editando ? (
				<FormEdicao
					inscricao={inscricao}
					onSalvar={(dados) => {
						atualizarInscricao(id, dados);
						setEditando(false);
					}}
					onCancelar={() => setEditando(false)}
				/>
			) : (
				<VisualizacaoDados inscricao={inscricao} />
			)}
		</PageContainer>
	);
}

// ────────────────────────────────────────────────────────
// Visualização de dados
// ────────────────────────────────────────────────────────
function VisualizacaoDados({ inscricao }: { inscricao: Inscricao }) {
	const { crismando, pai, mae, padrinho, controle } = inscricao;

	const faltCrismando = contarFaltantesPorSecao(inscricao, "Crismando");
	const faltPai = contarFaltantesPorSecao(inscricao, "Pai");
	const faltMae = contarFaltantesPorSecao(inscricao, "Mãe");

	return (
		<div className="flex flex-col gap-4">
			{/* Crismando */}
			<SecaoDados titulo="Dados do Crismando" alertas={faltCrismando}>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<CampoComCopia label="Nome" valor={crismando.nome} obrigatorio />
					<CampoComCopia
						label="Data de Nascimento"
						valor={crismando.dataNascimento}
						obrigatorio
					/>
					<CampoComCopia
						label="Celular"
						valor={crismando.celular}
						obrigatorio
					/>
					<CampoComCopia label="Sexo" valor={crismando.sexo} obrigatorio />
					<CampoComCopia
						label="Estado Civil"
						valor={crismando.estadoCivil}
						obrigatorio
					/>
					<CampoComCopia label="Naturalidade" valor={crismando.naturalidade} />
					<CampoComCopia
						label="Endereço"
						valor={crismando.endereco}
						obrigatorio
					/>
					<CampoComCopia label="Bairro" valor={crismando.bairro} obrigatorio />
					<CampoComCopia
						label="Município"
						valor={crismando.municipio}
						obrigatorio
					/>
					<CampoComCopia
						label="Batizado?"
						valor={crismando.batizado}
						obrigatorio
						tipo="boolean"
					/>
					<CampoComCopia
						label="Paróquia do Batismo"
						valor={crismando.paroquiaBatismo}
						obrigatorio={crismando.batizado === true}
					/>
					<CampoComCopia
						label="Fez Primeira Eucaristia?"
						valor={crismando.fezPrimeiraEucaristia}
						obrigatorio
						tipo="boolean"
					/>
					<CampoComCopia
						label="Paróquia da Eucaristia"
						valor={crismando.paroquiaEucaristia}
					/>
					<CampoComCopia
						label="Dia do Encontro"
						valor={crismando.diaEncontro}
						obrigatorio
					/>
					<CampoComCopia
						label="Horário"
						valor={crismando.horario}
						obrigatorio
					/>
				</div>
			</SecaoDados>

			{/* Pai */}
			<SecaoDados
				titulo="Dados do Pai"
				alertas={faltPai}
				defaultAberta={faltPai > 0}
			>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<CampoComCopia label="Nome" valor={pai.nome} obrigatorio />
					<CampoComCopia label="Estado Civil" valor={pai.estadoCivil} />
					<CampoComCopia label="Naturalidade" valor={pai.naturalidade} />
					<CampoComCopia label="Endereço" valor={pai.endereco} />
					<CampoComCopia label="Bairro" valor={pai.bairro} />
					<CampoComCopia label="Município" valor={pai.municipio} />
					<CampoComCopia label="Celular" valor={pai.celular} />
				</div>
			</SecaoDados>

			{/* Mãe */}
			<SecaoDados
				titulo="Dados da Mãe"
				alertas={faltMae}
				defaultAberta={faltMae > 0}
			>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<CampoComCopia label="Nome" valor={mae.nome} obrigatorio />
					<CampoComCopia label="Estado Civil" valor={mae.estadoCivil} />
					<CampoComCopia label="Naturalidade" valor={mae.naturalidade} />
					<CampoComCopia label="Endereço" valor={mae.endereco} />
					<CampoComCopia label="Bairro" valor={mae.bairro} />
					<CampoComCopia label="Município" valor={mae.municipio} />
					<CampoComCopia label="Celular" valor={mae.celular} />
				</div>
			</SecaoDados>

			{/* Padrinho */}
			<SecaoDados titulo="Padrinho / Madrinha" defaultAberta={false}>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<CampoComCopia label="Nome" valor={padrinho.nome} />
					<CampoComCopia label="Estado Civil" valor={padrinho.estadoCivil} />
					<CampoComCopia label="Celular" valor={padrinho.celular} />
					<CampoComCopia label="Endereço" valor={padrinho.endereco} />
					<CampoComCopia label="Bairro" valor={padrinho.bairro} />
					<CampoComCopia label="Município" valor={padrinho.municipio} />
				</div>
			</SecaoDados>

			{/* Controle administrativo */}
			<SecaoDados titulo="Controle Administrativo" defaultAberta={false}>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<CampoComCopia label="Catequistas" valor={controle.catequistas} />
					<CampoComCopia label="Celebrante" valor={controle.celebrante} />
					<CampoComCopia label="Local" valor={controle.local} />
					<CampoComCopia label="Data" valor={controle.data} />
					<CampoComCopia label="Livro" valor={controle.livro} />
					<CampoComCopia label="Folha" valor={controle.folha} />
					<CampoComCopia label="Número" valor={controle.numero} />
					<CampoComCopia
						label="Início da Preparação"
						valor={controle.inicioPreparacao}
					/>
					<CampoComCopia
						label="Fim da Preparação"
						valor={controle.fimPreparacao}
					/>
				</div>
			</SecaoDados>

			{/* Lista de campos faltantes */}
			{inscricao.camposFaltantes.length > 0 && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-5">
					<h3 className="mb-3 font-semibold text-red-800">
						Campos obrigatórios faltando ({inscricao.camposFaltantes.length})
					</h3>
					<ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
						{inscricao.camposFaltantes.map((campo) => (
							<li
								key={campo}
								className="flex items-center gap-2 text-sm text-red-700"
							>
								<span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
								{campo}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

// ────────────────────────────────────────────────────────
// Formulário de Edição
// ────────────────────────────────────────────────────────
interface FormEdicaoProps {
	inscricao: Inscricao;
	onSalvar: (dados: Partial<Omit<Inscricao, "id">>) => void;
	onCancelar: () => void;
}

function FormEdicao({ inscricao, onSalvar, onCancelar }: FormEdicaoProps) {
	const [crismando, setCrismando] = useState<DadosCrismando>({
		...inscricao.crismando,
	});
	const [pai, setPai] = useState<DadosPessoa>({ ...inscricao.pai });
	const [mae, setMae] = useState<DadosPessoa>({ ...inscricao.mae });
	const [padrinho, setPadrinho] = useState<DadosPadrinhoMadrinha>({
		...inscricao.padrinho,
	});
	const [controle, setControle] = useState<ControleAdministrativo>({
		...inscricao.controle,
	});

	function handleSalvar() {
		onSalvar({ crismando, pai, mae, padrinho, controle });
	}

	function updateCrismando<K extends keyof DadosCrismando>(
		key: K,
		value: DadosCrismando[K],
	) {
		setCrismando((prev) => ({ ...prev, [key]: value || null }));
	}

	function updatePai<K extends keyof DadosPessoa>(
		key: K,
		value: DadosPessoa[K],
	) {
		setPai((prev) => ({ ...prev, [key]: value || null }));
	}

	function updateMae<K extends keyof DadosPessoa>(
		key: K,
		value: DadosPessoa[K],
	) {
		setMae((prev) => ({ ...prev, [key]: value || null }));
	}

	function updatePadrinho<K extends keyof DadosPadrinhoMadrinha>(
		key: K,
		value: DadosPadrinhoMadrinha[K],
	) {
		setPadrinho((prev) => ({ ...prev, [key]: value || null }));
	}

	function updateControle<K extends keyof ControleAdministrativo>(
		key: K,
		value: ControleAdministrativo[K],
	) {
		setControle((prev) => ({ ...prev, [key]: value || null }));
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Crismando */}
			<SecaoDados titulo="Dados do Crismando">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Input
						label="Nome"
						value={crismando.nome ?? ""}
						onChange={(e) => updateCrismando("nome", e.target.value)}
					/>
					<Input
						label="Data de Nascimento"
						value={crismando.dataNascimento ?? ""}
						onChange={(e) => updateCrismando("dataNascimento", e.target.value)}
						placeholder="DD/MM/AAAA"
					/>
					<Input
						label="Celular"
						value={crismando.celular ?? ""}
						onChange={(e) => updateCrismando("celular", e.target.value)}
					/>
					<Select
						label="Sexo"
						value={crismando.sexo ?? ""}
						onChange={(e) => updateCrismando("sexo", e.target.value)}
						options={OPCOES_SEXO}
						placeholder="Selecione..."
					/>
					<Select
						label="Estado Civil"
						value={crismando.estadoCivil ?? ""}
						onChange={(e) => updateCrismando("estadoCivil", e.target.value)}
						options={OPCOES_ESTADO_CIVIL}
						placeholder="Selecione..."
					/>
					<Input
						label="Naturalidade"
						value={crismando.naturalidade ?? ""}
						onChange={(e) => updateCrismando("naturalidade", e.target.value)}
					/>
					<Input
						label="Endereço"
						value={crismando.endereco ?? ""}
						onChange={(e) => updateCrismando("endereco", e.target.value)}
					/>
					<Input
						label="Bairro"
						value={crismando.bairro ?? ""}
						onChange={(e) => updateCrismando("bairro", e.target.value)}
					/>
					<Input
						label="Município"
						value={crismando.municipio ?? ""}
						onChange={(e) => updateCrismando("municipio", e.target.value)}
					/>
					<Select
						label="É batizado?"
						value={
							crismando.batizado === null ? "" : String(crismando.batizado)
						}
						onChange={(e) =>
							updateCrismando(
								"batizado",
								e.target.value === "true"
									? true
									: e.target.value === "false"
										? false
										: null,
							)
						}
						options={OPCOES_SIM_NAO}
						placeholder="Selecione..."
					/>
					<Input
						label="Paróquia do Batismo"
						value={crismando.paroquiaBatismo ?? ""}
						onChange={(e) => updateCrismando("paroquiaBatismo", e.target.value)}
					/>
					<Select
						label="Fez 1ª Eucaristia?"
						value={
							crismando.fezPrimeiraEucaristia === null
								? ""
								: String(crismando.fezPrimeiraEucaristia)
						}
						onChange={(e) =>
							updateCrismando(
								"fezPrimeiraEucaristia",
								e.target.value === "true"
									? true
									: e.target.value === "false"
										? false
										: null,
							)
						}
						options={OPCOES_SIM_NAO}
						placeholder="Selecione..."
					/>
					<Input
						label="Paróquia da Eucaristia"
						value={crismando.paroquiaEucaristia ?? ""}
						onChange={(e) =>
							updateCrismando("paroquiaEucaristia", e.target.value)
						}
					/>
					<Input
						label="Dia do Encontro"
						value={crismando.diaEncontro ?? ""}
						onChange={(e) => updateCrismando("diaEncontro", e.target.value)}
						placeholder="Ex: Sábado"
					/>
					<Input
						label="Horário"
						value={crismando.horario ?? ""}
						onChange={(e) => updateCrismando("horario", e.target.value)}
						placeholder="Ex: 16h"
					/>
				</div>
			</SecaoDados>

			{/* Pai */}
			<SecaoDados titulo="Dados do Pai" defaultAberta={false}>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Input
						label="Nome"
						value={pai.nome ?? ""}
						onChange={(e) => updatePai("nome", e.target.value)}
					/>
					<Select
						label="Estado Civil"
						value={pai.estadoCivil ?? ""}
						onChange={(e) => updatePai("estadoCivil", e.target.value)}
						options={OPCOES_ESTADO_CIVIL}
						placeholder="Selecione..."
					/>
					<Input
						label="Naturalidade"
						value={pai.naturalidade ?? ""}
						onChange={(e) => updatePai("naturalidade", e.target.value)}
					/>
					<Input
						label="Endereço"
						value={pai.endereco ?? ""}
						onChange={(e) => updatePai("endereco", e.target.value)}
					/>
					<Input
						label="Bairro"
						value={pai.bairro ?? ""}
						onChange={(e) => updatePai("bairro", e.target.value)}
					/>
					<Input
						label="Município"
						value={pai.municipio ?? ""}
						onChange={(e) => updatePai("municipio", e.target.value)}
					/>
					<Input
						label="Celular"
						value={pai.celular ?? ""}
						maxLength={15}
						onChange={(e) =>
							updatePai("celular", mascaraTelefone(e.target.value))
						}
					/>
				</div>
			</SecaoDados>

			{/* Mãe */}
			<SecaoDados titulo="Dados da Mãe" defaultAberta={false}>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Input
						label="Nome"
						value={mae.nome ?? ""}
						onChange={(e) => updateMae("nome", e.target.value)}
					/>
					<Select
						label="Estado Civil"
						value={mae.estadoCivil ?? ""}
						onChange={(e) => updateMae("estadoCivil", e.target.value)}
						options={OPCOES_ESTADO_CIVIL}
						placeholder="Selecione..."
					/>
					<Input
						label="Naturalidade"
						value={mae.naturalidade ?? ""}
						onChange={(e) => updateMae("naturalidade", e.target.value)}
					/>
					<Input
						label="Endereço"
						value={mae.endereco ?? ""}
						onChange={(e) => updateMae("endereco", e.target.value)}
					/>
					<Input
						label="Bairro"
						value={mae.bairro ?? ""}
						onChange={(e) => updateMae("bairro", e.target.value)}
					/>
					<Input
						label="Município"
						value={mae.municipio ?? ""}
						onChange={(e) => updateMae("municipio", e.target.value)}
					/>
					<Input
						label="Celular"
						value={mae.celular ?? ""}
						maxLength={15}
						onChange={(e) =>
							updateMae("celular", mascaraTelefone(e.target.value))
						}
					/>
				</div>
			</SecaoDados>

			{/* Padrinho */}
			<SecaoDados titulo="Padrinho / Madrinha" defaultAberta={false}>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Input
						label="Nome"
						value={padrinho.nome ?? ""}
						onChange={(e) => updatePadrinho("nome", e.target.value)}
					/>
					<Select
						label="Estado Civil"
						value={padrinho.estadoCivil ?? ""}
						onChange={(e) => updatePadrinho("estadoCivil", e.target.value)}
						options={OPCOES_ESTADO_CIVIL}
						placeholder="Selecione..."
					/>
					<Input
						label="Celular"
						value={padrinho.celular ?? ""}
						maxLength={15}
						onChange={(e) =>
							updatePadrinho("celular", mascaraTelefone(e.target.value))
						}
					/>
					<Input
						label="Endereço"
						value={padrinho.endereco ?? ""}
						onChange={(e) => updatePadrinho("endereco", e.target.value)}
					/>
					<Input
						label="Bairro"
						value={padrinho.bairro ?? ""}
						onChange={(e) => updatePadrinho("bairro", e.target.value)}
					/>
					<Input
						label="Município"
						value={padrinho.municipio ?? ""}
						onChange={(e) => updatePadrinho("municipio", e.target.value)}
					/>
				</div>
			</SecaoDados>

			{/* Controle */}
			<SecaoDados titulo="Controle Administrativo" defaultAberta={false}>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Input
						label="Catequistas"
						value={controle.catequistas ?? ""}
						onChange={(e) => updateControle("catequistas", e.target.value)}
					/>
					<Input
						label="Celebrante"
						value={controle.celebrante ?? ""}
						onChange={(e) => updateControle("celebrante", e.target.value)}
					/>
					<Input
						label="Local"
						value={controle.local ?? ""}
						onChange={(e) => updateControle("local", e.target.value)}
					/>
					<Input
						label="Data"
						value={controle.data ?? ""}
						onChange={(e) => updateControle("data", e.target.value)}
					/>
					<Input
						label="Livro"
						value={controle.livro ?? ""}
						onChange={(e) => updateControle("livro", e.target.value)}
					/>
					<Input
						label="Folha"
						value={controle.folha ?? ""}
						onChange={(e) => updateControle("folha", e.target.value)}
					/>
					<Input
						label="Número"
						value={controle.numero ?? ""}
						onChange={(e) => updateControle("numero", e.target.value)}
					/>
					<Input
						label="Início da Preparação"
						value={controle.inicioPreparacao ?? ""}
						onChange={(e) => updateControle("inicioPreparacao", e.target.value)}
					/>
					<Input
						label="Fim da Preparação"
						value={controle.fimPreparacao ?? ""}
						onChange={(e) => updateControle("fimPreparacao", e.target.value)}
					/>
				</div>
			</SecaoDados>

			{/* Botões de ação */}
			<div className="sticky bottom-4 flex justify-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
				<Button variant="secondary" onClick={onCancelar}>
					<X className="h-4 w-4" />
					Cancelar
				</Button>
				<Button onClick={handleSalvar}>
					<Save className="h-4 w-4" />
					Salvar alterações
				</Button>
			</div>
		</div>
	);
}
