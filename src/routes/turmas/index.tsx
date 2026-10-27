import { createFileRoute, Link } from "@tanstack/react-router";
import { FileDown, GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { confirmar } from "../../components/ui/Dialog";
import { EmptyState } from "../../components/ui/misc";
import { toast } from "../../components/ui/Toast";
import { exportarTodasTurmasPDF } from "../../features/inscricoes/services/pdfService";
import { plural } from "../../features/turmas/components/formatos";
import { TurmaFormDialog } from "../../features/turmas/components/TurmaFormDialog";
import { excluirTurma } from "../../stores/acoes";
import { useEncontrosStore } from "../../stores/encontrosStore";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { usePresencasStore } from "../../stores/presencasStore";
import { useTurmasStore } from "../../stores/turmasStore";
import type { Turma } from "../../types/turma";
import { calcularPercentualFrequencia } from "../../utils/presenca";

export const Route = createFileRoute("/turmas/")({
	component: TurmasPage,
});

interface ResumoTurma {
	turma: Turma;
	membros: number;
	encontros: number;
	frequencia: number | null;
}

function TurmasPage() {
	const turmas = useTurmasStore((s) => s.turmas);
	const inscricoes = useInscricoesStore((s) => s.inscricoes);
	const encontros = useEncontrosStore((s) => s.encontros);
	const presencas = usePresencasStore((s) => s.presencas);

	const [dialogAberto, setDialogAberto] = useState(false);
	const [editando, setEditando] = useState<Turma | null>(null);

	const resumos = useMemo<ResumoTurma[]>(
		() =>
			turmas.map((turma) => {
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
					encontros: idsEncontros.size,
					frequencia: calcularPercentualFrequencia(daTurma),
				};
			}),
		[turmas, inscricoes, encontros, presencas],
	);

	const semTurma = inscricoes.filter((i) => !i.turmaId).length;
	const temMembros = resumos.some((r) => r.membros > 0);

	function abrirNova() {
		setEditando(null);
		setDialogAberto(true);
	}

	function abrirEdicao(turma: Turma) {
		setEditando(turma);
		setDialogAberto(true);
	}

	async function handleExcluir({ turma, membros, encontros }: ResumoTurma) {
		const ok = await confirmar({
			titulo: `Excluir a turma “${turma.nome}”?`,
			descricao: (
				<>
					{encontros > 0
						? `Os ${plural(encontros, "encontro", "encontros")} da turma e todas as presenças registradas serão apagados. `
						: ""}
					{membros > 0
						? `${membros === 1 ? "O membro ficará" : `Os ${membros} membros ficarão`} sem turma. `
						: ""}
					Esta ação não pode ser desfeita.
				</>
			),
			confirmar: "Excluir turma",
			perigo: true,
		});
		if (!ok) return;
		excluirTurma(turma.id);
		toast.sucesso(`Turma “${turma.nome}” excluída.`);
	}

	return (
		<PageContainer
			title="Turmas"
			description="Organize os inscritos em grupos e acompanhe a frequência."
			actions={
				<>
					{temMembros && (
						<Button
							variant="secondary"
							onClick={() => exportarTodasTurmasPDF(turmas, inscricoes)}
						>
							<FileDown />
							Exportar todas (PDF)
						</Button>
					)}
					<Button onClick={abrirNova}>
						<Plus />
						Nova turma
					</Button>
				</>
			}
		>
			{turmas.length === 0 ? (
				<Card>
					<EmptyState
						icon={<GraduationCap />}
						title="Nenhuma turma criada ainda"
						action={
							<Button onClick={abrirNova}>
								<Plus />
								Criar primeira turma
							</Button>
						}
					>
						Crie uma turma para começar a organizar os inscritos e registrar a
						chamada dos encontros.
					</EmptyState>
				</Card>
			) : (
				<section aria-label="Lista de turmas" className="flex flex-col gap-3">
					<div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
						<span>{plural(turmas.length, "turma", "turmas")}</span>
						{semTurma > 0 && (
							<Link to="/inscritos" search={{ turma: "sem" }} className="no-underline">
								<Badge tone="warn">
									{plural(semTurma, "inscrito sem turma", "inscritos sem turma")}
								</Badge>
							</Link>
						)}
					</div>
					<ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 p-0">
						{resumos.map((resumo) => (
							<li key={resumo.turma.id}>
								<TurmaCard
									resumo={resumo}
									onEditar={() => abrirEdicao(resumo.turma)}
									onExcluir={() => handleExcluir(resumo)}
								/>
							</li>
						))}
					</ul>
				</section>
			)}

			<TurmaFormDialog
				open={dialogAberto}
				onOpenChange={setDialogAberto}
				turma={editando}
			/>
		</PageContainer>
	);
}

function TurmaCard({
	resumo: { turma, membros, encontros, frequencia },
	onEditar,
	onExcluir,
}: {
	resumo: ResumoTurma;
	onEditar: () => void;
	onExcluir: () => void;
}) {
	const baixa = frequencia !== null && frequencia < 75;
	return (
		<Card className="flex h-full flex-col transition-shadow hover:shadow-pop">
			<div className="flex items-start gap-3 px-5 pt-5">
				<span
					className="mt-1.5 size-3.5 shrink-0 rounded-[4px]"
					style={{ backgroundColor: turma.cor }}
					aria-hidden="true"
				/>
				<div className="min-w-0 flex-1">
					<h2 className="font-serif text-xl leading-tight font-medium">
						<Link
							to="/turmas/$id"
							params={{ id: turma.id }}
							className="text-ink no-underline hover:text-accent"
						>
							{turma.nome}
						</Link>
					</h2>
					{turma.descricao && (
						<p className="mt-1 line-clamp-2 text-[13px] text-muted">
							{turma.descricao}
						</p>
					)}
				</div>
				<div className="-mt-1 -mr-2 flex shrink-0">
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onEditar}
						aria-label={`Editar turma ${turma.nome}`}
						title="Editar turma"
					>
						<Pencil />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onExcluir}
						aria-label={`Excluir turma ${turma.nome}`}
						title="Excluir turma"
						className="hover:bg-danger-soft hover:text-danger-ink"
					>
						<Trash2 />
					</Button>
				</div>
			</div>

			<div className="mt-auto flex flex-col gap-2 px-5 pt-5 pb-5">
				<div className="flex items-baseline justify-between gap-2 text-[13px]">
					<span className="text-muted">
						{plural(membros, "membro", "membros")} ·{" "}
						{plural(encontros, "encontro", "encontros")}
					</span>
					<span
						className={
							frequencia === null
								? "text-subtle"
								: baixa
									? "font-medium text-danger-ink tabular-nums"
									: "font-medium text-ink tabular-nums"
						}
					>
						{frequencia === null ? "sem chamada" : `${frequencia}%`}
					</span>
				</div>
				<div
					className="h-1.5 overflow-hidden rounded-full bg-sand"
					role="progressbar"
					aria-label={`Frequência da turma ${turma.nome}`}
					aria-valuenow={frequencia ?? 0}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					<div
						className="h-full rounded-full transition-[width] duration-500"
						style={{ width: `${frequencia ?? 0}%`, backgroundColor: turma.cor }}
					/>
				</div>
			</div>
		</Card>
	);
}
