import { Check } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { Input, Textarea } from "../../../components/ui/Input";
import { toast } from "../../../components/ui/Toast";
import { CORES_TURMA, useTurmasStore } from "../../../stores/turmasStore";
import type { Turma } from "../../../types/turma";
import { cn } from "../../../utils/cn";

const NOMES_CORES: Record<string, string> = {
	"#b8552f": "Terracota",
	"#4a6fa5": "Azul",
	"#4f7a3a": "Oliva",
	"#8e6ba8": "Violeta",
	"#c9862b": "Âmbar",
	"#2e8585": "Petróleo",
	"#a64d87": "Magenta",
	"#6b6a63": "Cinza quente",
};

/** Criação (turma ausente) ou edição de turma */
export function TurmaFormDialog({
	open,
	onOpenChange,
	turma,
	onCriada,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	turma?: Turma | null;
	onCriada?: (id: string) => void;
}) {
	const criarTurma = useTurmasStore((s) => s.criarTurma);
	const atualizarTurma = useTurmasStore((s) => s.atualizarTurma);
	const proximaCor = useTurmasStore((s) => s.proximaCor);

	const [nome, setNome] = useState("");
	const [descricao, setDescricao] = useState("");
	const [cor, setCor] = useState(CORES_TURMA[0] ?? "#b8552f");
	const [tentouSalvar, setTentouSalvar] = useState(false);

	useEffect(() => {
		if (!open) return;
		setNome(turma?.nome ?? "");
		setDescricao(turma?.descricao ?? "");
		setCor(turma?.cor ?? proximaCor());
		setTentouSalvar(false);
	}, [open, turma, proximaCor]);

	const nomeValido = nome.trim().length > 0;
	const cores = turma && !CORES_TURMA.includes(turma.cor)
		? [...CORES_TURMA, turma.cor]
		: CORES_TURMA;

	function salvar(e: FormEvent) {
		e.preventDefault();
		setTentouSalvar(true);
		if (!nomeValido) return;
		if (turma) {
			atualizarTurma(turma.id, {
				nome: nome.trim(),
				descricao: descricao.trim() || null,
				cor,
			});
			toast.sucesso("Turma atualizada.");
		} else {
			const id = criarTurma({ nome, descricao, cor });
			toast.sucesso(`Turma “${nome.trim()}” criada.`);
			onCriada?.(id);
		}
		onOpenChange(false);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
			title={turma ? "Editar turma" : "Nova turma"}
			size="sm"
		>
			<form onSubmit={salvar} className="flex flex-col gap-4" noValidate>
				<Input
					label="Nome da turma"
					required
					value={nome}
					onChange={(e) => setNome(e.target.value)}
					placeholder="Ex.: Sábado manhã"
					error={tentouSalvar && !nomeValido ? "Informe o nome da turma." : undefined}
					autoFocus
				/>
				<Textarea
					label="Descrição"
					value={descricao}
					onChange={(e) => setDescricao(e.target.value)}
					placeholder="Ex.: Encontros às 16h no salão paroquial"
					rows={2}
				/>
				<fieldset className="flex flex-col gap-2">
					<legend className="mb-2 text-[13px] font-medium text-ink-2">Cor</legend>
					<div role="radiogroup" aria-label="Cor da turma" className="flex flex-wrap gap-2">
						{cores.map((c) => {
							const ativa = c === cor;
							return (
								<button
									key={c}
									type="button"
									role="radio"
									aria-checked={ativa}
									aria-label={NOMES_CORES[c] ?? c}
									title={NOMES_CORES[c] ?? c}
									onClick={() => setCor(c)}
									className={cn(
										"flex size-8 items-center justify-center rounded-lg text-white transition-transform hover:scale-105",
										ativa && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
									)}
									style={{ backgroundColor: c }}
								>
									{ativa && <Check className="size-4" aria-hidden="true" />}
								</button>
							);
						})}
					</div>
				</fieldset>
				<div className="-mx-6 mt-1 flex flex-wrap justify-end gap-2 border-t border-line px-6 pt-4">
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button type="submit">{turma ? "Salvar alterações" : "Criar turma"}</Button>
				</div>
			</form>
		</Dialog>
	);
}
