import { createFileRoute, Link } from "@tanstack/react-router";
import { Edit2, GraduationCap, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";

export const Route = createFileRoute("/turmas/")({
	component: TurmasPage,
});

const CORES = [
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#ec4899",
	"#14b8a6",
	"#f97316",
];

interface FormTurma {
	nome: string;
	descricao: string;
	cor: string;
}

const FORM_VAZIO: FormTurma = { nome: "", descricao: "", cor: CORES[0] };

function TurmaCard({
	turma,
	membros,
	onEditar,
	onExcluir,
}: {
	turma: import("../../types/turma").Turma;
	membros: number;
	onEditar: (turma: import("../../types/turma").Turma) => void;
	onExcluir: (id: string) => void;
}) {
	return (
		<div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-3">
					<div
						className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
						style={{
							backgroundColor: turma.cor + "22",
							border: `2px solid ${turma.cor}`,
						}}
					>
						<GraduationCap className="h-5 w-5" style={{ color: turma.cor }} />
					</div>
					<div>
						<h3 className="font-semibold text-gray-900">{turma.nome}</h3>
						{turma.descricao && (
							<p className="text-sm text-gray-500">{turma.descricao}</p>
						)}
					</div>
				</div>
				<div className="flex gap-1">
					<button
						type="button"
						onClick={() => onEditar(turma)}
						className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
						title="Editar turma"
					>
						<Edit2 className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={() => onExcluir(turma.id)}
						className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
						title="Excluir turma"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</div>

			<div className="flex items-center justify-between border-t border-gray-100 pt-3">
				<div className="flex items-center gap-1.5 text-sm text-gray-500">
					<Users className="h-4 w-4" />
					<span>
						{membros} {membros === 1 ? "membro" : "membros"}
					</span>
				</div>
				<Link
					to="/turmas/$id"
					params={{ id: turma.id }}
					className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
				>
					Ver turma →
				</Link>
			</div>
		</div>
	);
}

function ModalTurma({
	form,
	modoEdicao,
	onChange,
	onSalvar,
	onCancelar,
}: {
	form: FormTurma;
	modoEdicao: boolean;
	onChange: (campo: keyof FormTurma, valor: string) => void;
	onSalvar: () => void;
	onCancelar: () => void;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<h2 className="mb-5 text-lg font-semibold text-gray-900">
					{modoEdicao ? "Editar turma" : "Nova turma"}
				</h2>

				<div className="flex flex-col gap-4">
					<Input
						label="Nome da turma *"
						value={form.nome}
						onChange={(e) => onChange("nome", e.target.value)}
						placeholder="Ex: Turma 2025 — Sábado"
						autoFocus
					/>
					<Input
						label="Descrição"
						value={form.descricao}
						onChange={(e) => onChange("descricao", e.target.value)}
						placeholder="Ex: Encontros às 16h no salão paroquial"
					/>

					<fieldset>
						<legend className="mb-2 block text-sm font-medium text-gray-700">
							Cor
						</legend>
						<div className="flex flex-wrap gap-2">
							{CORES.map((cor) => (
								<button
									key={cor}
									type="button"
									onClick={() => onChange("cor", cor)}
									className="h-8 w-8 rounded-full transition-transform hover:scale-110"
									style={{
										backgroundColor: cor,
										outline: form.cor === cor ? `3px solid ${cor}` : undefined,
										outlineOffset: form.cor === cor ? "2px" : undefined,
									}}
									title={cor}
									aria-pressed={form.cor === cor}
								/>
							))}
						</div>
					</fieldset>
				</div>

				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={onCancelar}>
						Cancelar
					</Button>
					<Button onClick={onSalvar} disabled={!form.nome.trim()}>
						{modoEdicao ? "Salvar alterações" : "Criar turma"}
					</Button>
				</div>
			</div>
		</div>
	);
}

function TurmasPage() {
	const { turmas, criarTurma, atualizarTurma, excluirTurma } = useTurmasStore();
	const { inscricoes } = useInscricoesStore();

	const [mostrarModal, setMostrarModal] = useState(false);
	const [editandoId, setEditandoId] = useState<string | null>(null);
	const [form, setForm] = useState<FormTurma>(FORM_VAZIO);

	function handleChange(campo: keyof FormTurma, valor: string) {
		setForm((prev) => ({ ...prev, [campo]: valor }));
	}

	function abrirNova() {
		setEditandoId(null);
		setForm(FORM_VAZIO);
		setMostrarModal(true);
	}

	function abrirEdicao(turma: import("../../types/turma").Turma) {
		setEditandoId(turma.id);
		setForm({
			nome: turma.nome,
			descricao: turma.descricao ?? "",
			cor: turma.cor,
		});
		setMostrarModal(true);
	}

	function handleSalvar() {
		if (!form.nome.trim()) return;
		if (editandoId) {
			atualizarTurma(editandoId, {
				nome: form.nome.trim(),
				descricao: form.descricao.trim() || null,
				cor: form.cor,
			});
		} else {
			criarTurma({ nome: form.nome, descricao: form.descricao, cor: form.cor });
		}
		setMostrarModal(false);
	}

	function handleExcluir(id: string) {
		const turma = turmas.find((t) => t.id === id);
		const membros = inscricoes.filter((i) => i.turmaId === id).length;
		const msg =
			membros > 0
				? `A turma "${turma?.nome}" tem ${membros} membro(s). Ao excluir, eles ficarão sem turma. Confirma?`
				: `Deseja excluir a turma "${turma?.nome}"?`;
		if (confirm(msg)) {
			excluirTurma(id);
		}
	}

	function getMembros(turmaId: string) {
		return inscricoes.filter((i) => i.turmaId === turmaId).length;
	}

	return (
		<>
			<PageContainer
				title="Turmas"
				description="Crie turmas e organize os inscritos por grupos"
				actions={
					<Button onClick={abrirNova} size="sm">
						<Plus className="h-4 w-4" />
						Nova turma
					</Button>
				}
			>
				{turmas.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
						<GraduationCap className="mb-4 h-12 w-12 text-gray-300" />
						<p className="text-lg font-medium text-gray-500">
							Nenhuma turma criada ainda
						</p>
						<p className="mt-1 text-sm text-gray-400">
							Crie uma turma para começar a organizar os inscritos
						</p>
						<Button onClick={abrirNova} className="mt-6">
							<Plus className="h-4 w-4" />
							Criar primeira turma
						</Button>
					</div>
				) : (
					<>
						<div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
							<span>
								{turmas.length} {turmas.length === 1 ? "turma" : "turmas"}
							</span>
							{inscricoes.filter((i) => !i.turmaId).length > 0 && (
								<span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
									{inscricoes.filter((i) => !i.turmaId).length} sem turma
								</span>
							)}
						</div>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{turmas.map((turma) => (
								<TurmaCard
									key={turma.id}
									turma={turma}
									membros={getMembros(turma.id)}
									onEditar={abrirEdicao}
									onExcluir={handleExcluir}
								/>
							))}
						</div>
					</>
				)}
			</PageContainer>

			{mostrarModal && (
				<ModalTurma
					form={form}
					modoEdicao={!!editandoId}
					onChange={handleChange}
					onSalvar={handleSalvar}
					onCancelar={() => setMostrarModal(false)}
				/>
			)}
		</>
	);
}
