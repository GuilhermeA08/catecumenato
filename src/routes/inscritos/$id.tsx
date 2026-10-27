import {
	createFileRoute,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import {
	CheckCircle2,
	Clock,
	Copy,
	Pencil,
	Printer,
	RotateCcw,
	Trash2,
	UserX,
} from "lucide-react";
import { useId, useState } from "react";
import { FichaDados } from "../../components/inscrito/FichaDados";
import { FrequenciaInscrito } from "../../components/inscrito/FrequenciaInscrito";
import {
	extrairFicha,
	InscricaoForm,
} from "../../components/inscrito/InscricaoForm";
import { type ItemMenu, MenuAcoes } from "../../components/inscrito/MenuAcoes";
import { OQueFaltaCard } from "../../components/inscrito/OQueFaltaCard";
import { StatusBadge } from "../../components/inscrito/StatusBadge";
import { WhatsAppButton } from "../../components/inscrito/WhatsAppButton";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Card } from "../../components/ui/Card";
import { confirmar } from "../../components/ui/Dialog";
import { controlClasses } from "../../components/ui/Input";
import { Avatar, EmptyState } from "../../components/ui/misc";
import { toast } from "../../components/ui/Toast";
import { exportarTurmaFichasInscricaoPDF } from "../../features/inscricoes/services/pdfService";
import { excluirInscricao, vincularTurma } from "../../stores/acoes";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";
import { Status } from "../../types/enums";
import type { Inscricao } from "../../types/inscricao";
import { copiarParaClipboard } from "../../utils/clipboard";
import { cn } from "../../utils/cn";
import { calcularIdade } from "../../utils/mascaras";

export const Route = createFileRoute("/inscritos/$id")({
	beforeLoad: () => {
		if (!useInscricoesStore.getState().carregado) throw redirect({ to: "/" });
	},
	component: InscritoPage,
});

function InscritoPage() {
	const { id } = Route.useParams();
	const inscricao = useInscricoesStore((s) =>
		s.inscricoes.find((i) => i.id === id),
	);
	const [editando, setEditando] = useState(false);

	if (!inscricao) return <NaoEncontrado />;
	if (editando) {
		return (
			<EdicaoInscrito inscricao={inscricao} onFechar={() => setEditando(false)} />
		);
	}
	return <FichaInscrito inscricao={inscricao} onEditar={() => setEditando(true)} />;
}

function NaoEncontrado() {
	return (
		<PageContainer
			breadcrumbs={[
				{ label: "Inscritos", to: "/inscritos" },
				{ label: "Não encontrado" },
			]}
		>
			<Card>
				<EmptyState
					icon={<UserX />}
					title="Inscrito não encontrado"
					action={<ButtonLink to="/inscritos">Voltar para inscritos</ButtonLink>}
				>
					Esta ficha não existe ou foi excluída.
				</EmptyState>
			</Card>
		</PageContainer>
	);
}

function EdicaoInscrito({
	inscricao,
	onFechar,
}: {
	inscricao: Inscricao;
	onFechar: () => void;
}) {
	const atualizarInscricao = useInscricoesStore((s) => s.atualizarInscricao);
	const nome = inscricao.crismando.nome ?? "Sem nome";
	const [inicial] = useState(() => extrairFicha(inscricao));

	return (
		<PageContainer
			breadcrumbs={[
				{ label: "Inscritos", to: "/inscritos" },
				{ label: nome },
			]}
			eyebrow={nome}
			title="Editar ficha"
		>
			<InscricaoForm
				inicial={inicial}
				rotuloSalvar="Salvar alterações"
				onCancelar={onFechar}
				onSalvar={(dados) => {
					atualizarInscricao(inscricao.id, dados);
					toast.sucesso("Ficha atualizada.");
					onFechar();
					window.scrollTo({ top: 0 });
				}}
			/>
		</PageContainer>
	);
}

function textoCompleto(inscricao: Inscricao, turma: string | null): string {
	const { crismando: c, pai, mae, padrinho: p } = inscricao;
	const v = (x: string | boolean | null) =>
		x === null || x === "" ? "—" : x === true ? "Sim" : x === false ? "Não" : x;
	return [
		`Nome: ${v(c.nome)}`,
		`Data de nascimento: ${v(c.dataNascimento)}`,
		`Celular: ${v(c.celular)}`,
		`Sexo: ${v(c.sexo)}`,
		`Estado civil: ${v(c.estadoCivil)}`,
		`Naturalidade: ${v(c.naturalidade)}`,
		`Endereço: ${v(c.endereco)}`,
		`Bairro: ${v(c.bairro)}`,
		`Município: ${v(c.municipio)}`,
		`Batizado(a): ${v(c.batizado)}`,
		`Paróquia do batismo: ${v(c.paroquiaBatismo)}`,
		`Primeira Eucaristia: ${v(c.fezPrimeiraEucaristia)}`,
		`Paróquia da Eucaristia: ${v(c.paroquiaEucaristia)}`,
		`Encontro: ${v(c.diaEncontro)} ${c.horario ?? ""}`.trim(),
		`Turma: ${turma ?? "—"}`,
		"",
		`Pai: ${v(pai.nome)} · ${v(pai.celular)}`,
		`Mãe: ${v(mae.nome)} · ${v(mae.celular)}`,
		`Padrinho/madrinha: ${v(p.nome)} · ${v(p.celular)}`,
	].join("\n");
}

function FichaInscrito({
	inscricao,
	onEditar,
}: {
	inscricao: Inscricao;
	onEditar: () => void;
}) {
	const navigate = useNavigate();
	const turmaSelectId = useId();
	const turmas = useTurmasStore((s) => s.turmas);
	const alterarStatus = useInscricoesStore((s) => s.alterarStatus);
	const { id, crismando, status, statusOverride } = inscricao;
	const nome = crismando.nome ?? "Nome não informado";
	const turma = turmas.find((t) => t.id === inscricao.turmaId) ?? null;
	const idade = calcularIdade(crismando.dataNascimento);
	const subtitulo = [
		idade !== null && `${idade} anos`,
		crismando.municipio,
		crismando.celular,
	].filter(Boolean);

	function imprimir() {
		exportarTurmaFichasInscricaoPDF(
			turma ?? { id: "", nome: "Sem turma", descricao: null, cor: "", criadaEm: "" },
			[inscricao],
		);
	}

	async function copiarTudo() {
		const ok = await copiarParaClipboard(textoCompleto(inscricao, turma?.nome ?? null));
		if (ok) toast.sucesso("Dados da ficha copiados.");
		else toast.erro("Não foi possível copiar os dados.");
	}

	function forcarStatus(novo: Status) {
		alterarStatus(id, novo, true);
		toast.info(
			`Status marcado manualmente como ${novo === Status.CONCLUIDO ? "concluído" : "pendente"}.`,
		);
	}

	function statusAutomatico() {
		alterarStatus(id, status, false);
		toast.info("Status voltou a ser calculado pelos campos preenchidos.");
	}

	async function excluir() {
		const ok = await confirmar({
			titulo: "Excluir inscrito?",
			descricao: `A ficha de ${nome} e o histórico de presença serão apagados. Esta ação não pode ser desfeita.`,
			confirmar: "Excluir",
			perigo: true,
		});
		if (!ok) return;
		await navigate({ to: "/inscritos" });
		excluirInscricao(id);
		toast.sucesso(`${nome} foi excluído(a).`);
	}

	const itensMenu: ItemMenu[] = [
		{ label: "Copiar todos os dados", icon: <Copy />, onSelect: copiarTudo },
		...(statusOverride && status === Status.CONCLUIDO
			? []
			: [
					{
						label: "Marcar como concluído",
						icon: <CheckCircle2 />,
						onSelect: () => forcarStatus(Status.CONCLUIDO),
						separadoAntes: true,
					},
				]),
		...(statusOverride && status === Status.PENDENTE
			? []
			: [
					{
						label: "Marcar como pendente",
						icon: <Clock />,
						onSelect: () => forcarStatus(Status.PENDENTE),
						separadoAntes: statusOverride,
					},
				]),
		...(statusOverride
			? [
					{
						label: "Voltar ao status automático",
						icon: <RotateCcw />,
						onSelect: statusAutomatico,
					},
				]
			: []),
		{
			label: "Excluir inscrito",
			icon: <Trash2 />,
			onSelect: excluir,
			perigo: true,
			separadoAntes: true,
		},
	];

	return (
		<PageContainer
			breadcrumbs={[{ label: "Inscritos", to: "/inscritos" }, { label: nome }]}
		>
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex min-w-0 items-center gap-4">
					<Avatar nome={crismando.nome} size="lg" />
					<div className="min-w-0">
						<h1 className="font-serif text-[28px] leading-tight font-normal tracking-[-0.01em] break-words sm:text-[32px]">
							{nome}
						</h1>
						{subtitulo.length > 0 && (
							<p className="mt-0.5 text-[13px] text-muted">
								{subtitulo.join(" · ")}
							</p>
						)}
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<StatusBadge
								status={status}
								completude={inscricao.completude}
								manual={statusOverride}
							/>
							<label
								htmlFor={turmaSelectId}
								className="inline-flex items-center gap-1.5 text-[13px] text-muted"
							>
								Turma
								{turma && (
									<span
										className="size-2.5 rounded-[3px]"
										style={{ backgroundColor: turma.cor }}
										aria-hidden="true"
									/>
								)}
							</label>
							<select
								id={turmaSelectId}
								value={inscricao.turmaId ?? ""}
								onChange={(e) => {
									vincularTurma(id, e.target.value || null);
									toast.sucesso(
										e.target.value
											? "Turma atualizada."
											: "Inscrito removido da turma.",
									);
								}}
								className={cn(controlClasses, "h-8 w-auto max-w-[220px] pr-7 text-[13px]")}
							>
								<option value="">Sem turma</option>
								{turmas.map((t) => (
									<option key={t.id} value={t.id}>
										{t.nome}
									</option>
								))}
							</select>
						</div>
						{statusOverride && (
							<p className="mt-2 text-xs text-muted">
								Status definido manualmente.{" "}
								<button
									type="button"
									onClick={statusAutomatico}
									className="font-medium text-accent underline-offset-2 hover:underline"
								>
									Voltar ao automático
								</button>
							</p>
						)}
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="secondary" onClick={imprimir}>
						<Printer />
						Imprimir ficha
					</Button>
					<Button variant="secondary" onClick={onEditar}>
						<Pencil />
						Editar
					</Button>
					<WhatsAppButton
						inscricao={inscricao}
						variant="primary"
						label={inscricao.camposFaltantes.length > 0 ? "Cobrar dados" : "WhatsApp"}
					/>
					<MenuAcoes itens={itensMenu} />
				</div>
			</header>

			<div className="flex flex-wrap items-start gap-5">
				<div className="min-w-0 flex-[999_1_480px]">
					<FichaDados inscricao={inscricao} />
				</div>
				<aside
					aria-label="Situação da ficha"
					className="flex min-w-0 flex-[1_1_300px] flex-col gap-4"
				>
					<OQueFaltaCard inscricao={inscricao} />
					<FrequenciaInscrito inscricao={inscricao} />
				</aside>
			</div>
		</PageContainer>
	);
}
