import { createFileRoute } from "@tanstack/react-router";
import { FileDown, FileText, GraduationCap, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Card } from "../../components/ui/Card";
import { EmptyState, Tabs } from "../../components/ui/misc";
import {
	exportarTurmaFichasInscricaoPDF,
	exportarTurmaPDF,
} from "../../features/inscricoes/services/pdfService";
import { AdicionarMembrosDialog } from "../../features/turmas/components/AdicionarMembrosDialog";
import { ChamadaTab, encontroPadrao } from "../../features/turmas/components/ChamadaTab";
import { EncontroFormDialog } from "../../features/turmas/components/EncontroFormDialog";
import { plural } from "../../features/turmas/components/formatos";
import { FrequenciaTab } from "../../features/turmas/components/FrequenciaTab";
import { IdadesTab } from "../../features/turmas/components/IdadesTab";
import { MembrosTab } from "../../features/turmas/components/MembrosTab";
import { TurmaFormDialog } from "../../features/turmas/components/TurmaFormDialog";
import { useDadosTurma } from "../../features/turmas/components/useDadosTurma";
import type { Encontro } from "../../types/encontro";
import { StatusPresenca } from "../../types/enums";

export const Route = createFileRoute("/turmas/$id")({
	component: TurmaDetalhePage,
});

type Aba = "chamada" | "membros" | "frequencia" | "idades";

function TurmaDetalhePage() {
	const { id } = Route.useParams();
	const { turma, inscricoes, membros, encontros, chamada, frequencias } =
		useDadosTurma(id);

	const [aba, setAba] = useState<Aba>("chamada");
	const [encontroSelecionadoId, setEncontroSelecionadoId] = useState<string | null>(
		null,
	);
	const [editarTurmaAberto, setEditarTurmaAberto] = useState(false);
	const [adicionarAberto, setAdicionarAberto] = useState(false);
	const [encontroDialog, setEncontroDialog] = useState<{
		aberto: boolean;
		encontro: Encontro | null;
	}>({ aberto: false, encontro: null });

	if (!turma) {
		return (
			<PageContainer breadcrumbs={[{ label: "Turmas", to: "/turmas" }]}>
				<Card>
					<EmptyState
						icon={<GraduationCap />}
						title="Turma não encontrada"
						action={
							<ButtonLink to="/turmas" variant="secondary">
								Voltar para turmas
							</ButtonLink>
						}
					>
						Esta turma não existe ou foi excluída.
					</EmptyState>
				</Card>
			</PageContainer>
		);
	}

	const disponiveis = inscricoes.filter((i) => !i.turmaId).length;
	const encontrosComChamada = encontros.filter((e) =>
		[...(chamada.get(e.id)?.values() ?? [])].some(
			(s) => s !== StatusPresenca.PENDENTE,
		),
	).length;

	function abrirNovoEncontro() {
		setEncontroDialog({ aberto: true, encontro: null });
	}

	const descricao = [
		plural(membros.length, "membro", "membros"),
		plural(encontros.length, "encontro", "encontros"),
		turma.descricao,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<PageContainer
			breadcrumbs={[{ label: "Turmas", to: "/turmas" }, { label: turma.nome }]}
			title={
				<span className="flex items-center gap-3">
					<span
						className="size-3.5 shrink-0 rounded-[4px]"
						style={{ backgroundColor: turma.cor }}
						aria-hidden="true"
					/>
					<span className="min-w-0 break-words">{turma.nome}</span>
				</span>
			}
			description={descricao}
			actions={
				<>
					<Button
						variant="secondary"
						onClick={() => exportarTurmaPDF(turma, membros)}
						disabled={membros.length === 0}
					>
						<FileDown />
						Lista em PDF
					</Button>
					<Button
						variant="secondary"
						onClick={() => exportarTurmaFichasInscricaoPDF(turma, membros)}
						disabled={membros.length === 0}
					>
						<FileText />
						Fichas em PDF
					</Button>
					<Button variant="secondary" onClick={() => setEditarTurmaAberto(true)}>
						<Pencil />
						Editar turma
					</Button>
					<Button onClick={abrirNovoEncontro}>
						<Plus />
						Novo encontro
					</Button>
				</>
			}
		>
			<div className="flex flex-col gap-5 [&>*]:min-w-0">
				<Tabs
					label="Seções da turma"
					value={aba}
					onChange={setAba}
					tabs={[
						{ value: "chamada", label: "Chamada" },
						{ value: "membros", label: `Membros (${membros.length})` },
						{ value: "frequencia", label: "Frequência" },
						{ value: "idades", label: "Idades" },
					]}
				/>
				<div role="tabpanel" id={`painel-${aba}`} aria-labelledby={`tab-${aba}`}>
					{aba === "chamada" && (
						<ChamadaTab
							membros={membros}
							encontros={encontros}
							chamada={chamada}
							frequencias={frequencias}
							selecionadoId={encontroSelecionadoId}
							onSelecionar={setEncontroSelecionadoId}
							onNovoEncontro={abrirNovoEncontro}
							onEditarEncontro={(encontro) =>
								setEncontroDialog({ aberto: true, encontro })
							}
							onIrParaMembros={() => setAba("membros")}
						/>
					)}
					{aba === "membros" && (
						<MembrosTab
							turma={turma}
							membros={membros}
							disponiveis={disponiveis}
							onAdicionar={() => setAdicionarAberto(true)}
						/>
					)}
					{aba === "frequencia" && (
						<FrequenciaTab
							frequencias={[...frequencias.values()]}
							encontrosComChamada={encontrosComChamada}
						/>
					)}
					{aba === "idades" && <IdadesTab membros={membros} cor={turma.cor} />}
				</div>
			</div>

			<TurmaFormDialog
				open={editarTurmaAberto}
				onOpenChange={setEditarTurmaAberto}
				turma={turma}
			/>
			<AdicionarMembrosDialog
				open={adicionarAberto}
				onOpenChange={setAdicionarAberto}
				turma={turma}
				inscricoes={inscricoes}
			/>
			<EncontroFormDialog
				open={encontroDialog.aberto}
				onOpenChange={(aberto) => setEncontroDialog((atual) => ({ ...atual, aberto }))}
				turmaId={turma.id}
				encontro={encontroDialog.encontro}
				sugestao={encontroPadrao(encontros)}
				onSalvo={(encontroId) => {
					setEncontroSelecionadoId(encontroId);
					setAba("chamada");
				}}
			/>
		</PageContainer>
	);
}
