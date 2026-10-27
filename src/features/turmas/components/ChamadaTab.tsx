import { CalendarDays, CheckCheck, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { confirmar } from "../../../components/ui/Dialog";
import { Avatar, EmptyState, Segmented } from "../../../components/ui/misc";
import { toast } from "../../../components/ui/Toast";
import { excluirEncontro } from "../../../stores/acoes";
import { usePresencasStore } from "../../../stores/presencasStore";
import type { Encontro } from "../../../types/encontro";
import { StatusPresenca } from "../../../types/enums";
import type { Inscricao } from "../../../types/inscricao";
import { cn } from "../../../utils/cn";
import {
	formatarDataCompleta,
	formatarDiaMes,
	formatarDiaSemana,
	hojeIso,
	horarioEncontro,
	nomeInscrito,
	plural,
} from "./formatos";
import {
	contarChamada,
	type FrequenciaMembro,
	type MapaChamada,
	statusDe,
} from "./useDadosTurma";

const OPCOES_PRESENCA = [
	{
		value: StatusPresenca.PRESENTE,
		label: "Presente",
		activeClassName: "bg-ok font-medium text-white",
	},
	{
		value: StatusPresenca.FALTA_JUSTIFICADA,
		label: "Justificada",
		activeClassName:
			"bg-surface font-medium text-warn-ink shadow-[0_1px_2px_rgb(20_20_19/0.1)]",
	},
	{
		value: StatusPresenca.AUSENTE,
		label: "Falta",
		activeClassName: "bg-danger font-medium text-white",
	},
];

/** Encontro mais recente até hoje (ou o primeiro futuro) */
export function encontroPadrao(encontros: Encontro[]): Encontro | undefined {
	const hoje = hojeIso();
	const passados = encontros.filter((e) => e.dataEncontro <= hoje);
	return passados[passados.length - 1] ?? encontros[0];
}

export function ChamadaTab({
	membros,
	encontros,
	chamada,
	frequencias,
	selecionadoId,
	onSelecionar,
	onNovoEncontro,
	onEditarEncontro,
	onIrParaMembros,
}: {
	membros: Inscricao[];
	encontros: Encontro[];
	chamada: MapaChamada;
	frequencias: Map<string, FrequenciaMembro>;
	selecionadoId: string | null;
	onSelecionar: (id: string) => void;
	onNovoEncontro: () => void;
	onEditarEncontro: (encontro: Encontro) => void;
	onIrParaMembros: () => void;
}) {
	const definirStatus = usePresencasStore((s) => s.definirStatus);
	const registrarLote = usePresencasStore((s) => s.registrarLote);

	const selecionado =
		encontros.find((e) => e.id === selecionadoId) ?? encontroPadrao(encontros);

	if (encontros.length === 0) {
		return (
			<Card>
				<EmptyState
					icon={<CalendarDays />}
					title="Nenhum encontro ainda"
					action={
						<Button onClick={onNovoEncontro}>
							<Plus />
							Novo encontro
						</Button>
					}
				>
					Crie o primeiro encontro para registrar a chamada da turma.
				</EmptyState>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-4 [&>*]:min-w-0">
			<FaixaEncontros
				encontros={encontros}
				membros={membros}
				chamada={chamada}
				selecionadoId={selecionado?.id ?? null}
				onSelecionar={onSelecionar}
			/>
			{selecionado && (
				<CartaoChamada
					encontro={selecionado}
					membros={membros}
					chamada={chamada}
					frequencias={frequencias}
					onEditar={() => onEditarEncontro(selecionado)}
					onIrParaMembros={onIrParaMembros}
					onDefinir={(inscritoId, status) =>
						definirStatus(selecionado.id, inscritoId, status)
					}
					onTodosPresentes={() => {
						const itens = membros
							.filter(
								(m) =>
									statusDe(chamada, selecionado.id, m.id) ===
									StatusPresenca.PENDENTE,
							)
							.map((m) => ({ inscritoId: m.id, status: StatusPresenca.PRESENTE }));
						if (itens.length === 0) return;
						registrarLote(selecionado.id, itens);
						toast.sucesso(
							`${plural(itens.length, "membro marcado", "membros marcados")} como presente.`,
						);
					}}
				/>
			)}
		</div>
	);
}

function FaixaEncontros({
	encontros,
	membros,
	chamada,
	selecionadoId,
	onSelecionar,
}: {
	encontros: Encontro[];
	membros: Inscricao[];
	chamada: MapaChamada;
	selecionadoId: string | null;
	onSelecionar: (id: string) => void;
}) {
	const selecionadoRef = useRef<HTMLButtonElement>(null);
	const hoje = hojeIso();

	useEffect(() => {
		selecionadoRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
	}, [selecionadoId]);

	return (
		<div
			role="group"
			aria-label="Encontros da turma"
			className="-mx-1 flex gap-2 overflow-x-auto px-1 pt-1 pb-2"
		>
			{encontros.map((e) => {
				const ativo = e.id === selecionadoId;
				const c = contarChamada(chamada, e.id, membros);
				const marcados = c.presente + c.justificada + c.falta;
				const resumo =
					marcados === 0
						? e.dataEncontro === hoje
							? "hoje"
							: "sem chamada"
						: `${c.presente}/${membros.length} presentes`;
				return (
					<button
						key={e.id}
						ref={ativo ? selecionadoRef : undefined}
						type="button"
						aria-pressed={ativo}
						aria-label={`Encontro de ${formatarDataCompleta(e.dataEncontro)}, ${resumo}`}
						onClick={() => onSelecionar(e.id)}
						className={cn(
							"flex w-[104px] shrink-0 flex-col items-start gap-0.5 rounded-xl bg-surface px-3 py-2.5 text-left transition-colors",
							ativo
								? "shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
								: "shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-sidebar",
						)}
					>
						<span className="text-xs text-muted">{formatarDiaSemana(e.dataEncontro)}</span>
						<span className="font-serif text-xl leading-tight tabular-nums">
							{formatarDiaMes(e.dataEncontro)}
						</span>
						<span
							className={cn(
								"text-xs whitespace-nowrap",
								marcados === 0 ? "text-subtle" : "text-muted",
							)}
						>
							{resumo}
						</span>
					</button>
				);
			})}
		</div>
	);
}

function CartaoChamada({
	encontro,
	membros,
	chamada,
	frequencias,
	onEditar,
	onDefinir,
	onTodosPresentes,
	onIrParaMembros,
}: {
	encontro: Encontro;
	membros: Inscricao[];
	chamada: MapaChamada;
	frequencias: Map<string, FrequenciaMembro>;
	onEditar: () => void;
	onDefinir: (inscritoId: string, status: StatusPresenca) => void;
	onTodosPresentes: () => void;
	onIrParaMembros: () => void;
}) {
	const c = contarChamada(chamada, encontro.id, membros);
	const contagem = [
		plural(c.presente, "presente", "presentes"),
		plural(c.justificada, "justificada", "justificadas"),
		plural(c.falta, "falta", "faltas"),
		c.pendente > 0 ? `${c.pendente} sem marcação` : null,
	]
		.filter(Boolean)
		.join(" · ");

	async function excluir() {
		const ok = await confirmar({
			titulo: `Excluir o encontro de ${formatarDiaMes(encontro.dataEncontro)}?`,
			descricao: "A chamada registrada neste encontro também será apagada.",
			confirmar: "Excluir encontro",
			perigo: true,
		});
		if (!ok) return;
		excluirEncontro(encontro.id);
		toast.sucesso("Encontro excluído.");
	}

	return (
		<Card className="overflow-hidden">
			<div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
				<div className="min-w-0">
					<h2 className="font-serif text-xl leading-tight font-medium">
						Chamada de {formatarDiaMes(encontro.dataEncontro)}
					</h2>
					<p className="mt-1 text-[13px] text-muted">
						{horarioEncontro(encontro)} · {encontro.local || "local não informado"}
					</p>
					{membros.length > 0 && (
						<p className="mt-0.5 text-[13px] text-muted tabular-nums">{contagem}</p>
					)}
					{encontro.observacoes && (
						<p className="mt-1 text-[13px] text-ink-2">{encontro.observacoes}</p>
					)}
				</div>
				<div className="flex flex-wrap items-center gap-1">
					{membros.length > 0 && (
						<Button
							variant="secondary"
							size="sm"
							onClick={onTodosPresentes}
							disabled={c.pendente === 0}
							title={
								c.pendente === 0
									? "Todos os membros já têm marcação"
									: "Marca como presente quem ainda não tem marcação"
							}
						>
							<CheckCheck />
							Marcar todos presentes
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onEditar}
						aria-label="Editar encontro"
						title="Editar encontro"
					>
						<Pencil />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={excluir}
						aria-label="Excluir encontro"
						title="Excluir encontro"
						className="hover:bg-danger-soft hover:text-danger-ink"
					>
						<Trash2 />
					</Button>
				</div>
			</div>

			{membros.length === 0 ? (
				<EmptyState
					icon={<Users />}
					title="Turma sem membros"
					action={
						<Button variant="secondary" onClick={onIrParaMembros}>
							Adicionar membros
						</Button>
					}
				>
					Adicione inscritos à turma para registrar a presença.
				</EmptyState>
			) : (
				<ul className="m-0 list-none p-0">
					{membros.map((m) => {
						const nome = nomeInscrito(m);
						const freq = frequencias.get(m.id)?.percentual ?? null;
						return (
							<li
								key={m.id}
								className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line/60 px-5 py-2.5 first:border-t-0 sm:px-6"
							>
								<Avatar nome={m.crismando.nome} size="sm" />
								<div className="min-w-0 flex-[1_1_160px]">
									<p className="truncate font-medium">{nome}</p>
									<p
										className={cn(
											"text-xs",
											freq !== null && freq < 75 ? "text-danger-ink" : "text-muted",
										)}
									>
										{freq === null ? "Sem frequência registrada" : `Frequência ${freq}%`}
									</p>
								</div>
								<Segmented
									label={`Presença de ${nome}`}
									size="sm"
									value={statusDe(chamada, encontro.id, m.id)}
									onChange={(status) => onDefinir(m.id, status)}
									options={OPCOES_PRESENCA}
								/>
							</li>
						);
					})}
				</ul>
			)}
		</Card>
	);
}
