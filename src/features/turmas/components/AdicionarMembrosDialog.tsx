import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TurmaTag } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import { Segmented } from "../../../components/ui/misc";
import { toast } from "../../../components/ui/Toast";
import { vincularTurma } from "../../../stores/acoes";
import { useTurmasStore } from "../../../stores/turmasStore";
import type { Inscricao } from "../../../types/inscricao";
import type { Turma } from "../../../types/turma";
import {
	compararPorNome,
	infoInscrito,
	nomeInscrito,
	normalizarBusca,
	plural,
} from "./formatos";

type Filtro = "sem" | "todos";

export function AdicionarMembrosDialog({
	open,
	onOpenChange,
	turma,
	inscricoes,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	turma: Turma;
	inscricoes: Inscricao[];
}) {
	const turmas = useTurmasStore((s) => s.turmas);
	const [busca, setBusca] = useState("");
	const [filtro, setFiltro] = useState<Filtro>("sem");
	const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

	const candidatos = useMemo(
		() => inscricoes.filter((i) => i.turmaId !== turma.id).sort(compararPorNome),
		[inscricoes, turma.id],
	);
	const semTurma = candidatos.filter((i) => !i.turmaId).length;

	useEffect(() => {
		if (!open) return;
		setBusca("");
		setSelecionados(new Set());
		setFiltro(semTurma > 0 ? "sem" : "todos");
		// Reinicia só ao abrir
	}, [open]);

	const visiveis = useMemo(() => {
		const q = normalizarBusca(busca);
		return candidatos.filter(
			(i) =>
				(filtro === "todos" || !i.turmaId) &&
				(!q || normalizarBusca(nomeInscrito(i)).includes(q)),
		);
	}, [candidatos, busca, filtro]);

	const turmaPorId = new Map(turmas.map((t) => [t.id, t]));
	const todosVisiveisMarcados =
		visiveis.length > 0 && visiveis.every((i) => selecionados.has(i.id));

	function alternar(id: string) {
		setSelecionados((atual) => {
			const novo = new Set(atual);
			if (novo.has(id)) novo.delete(id);
			else novo.add(id);
			return novo;
		});
	}

	function alternarTodos() {
		setSelecionados((atual) => {
			const novo = new Set(atual);
			for (const i of visiveis) {
				if (todosVisiveisMarcados) novo.delete(i.id);
				else novo.add(i.id);
			}
			return novo;
		});
	}

	function adicionar() {
		for (const id of selecionados) vincularTurma(id, turma.id);
		toast.sucesso(
			`${plural(selecionados.size, "membro adicionado", "membros adicionados")} à turma.`,
		);
		onOpenChange(false);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
			title="Adicionar membros"
			description={`Escolha os inscritos que vão participar de “${turma.nome}”.`}
			scrollBody
			footer={
				<>
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={adicionar} disabled={selecionados.size === 0}>
						{selecionados.size === 0
							? "Adicionar"
							: `Adicionar ${selecionados.size}`}
					</Button>
				</>
			}
		>
			<div className="sticky top-0 z-10 -mx-6 flex flex-col gap-3 bg-surface px-6 pb-3">
				<div className="relative">
					<Search
						className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
						aria-hidden="true"
					/>
					<Input
						type="search"
						aria-label="Buscar inscrito por nome"
						placeholder="Buscar por nome…"
						value={busca}
						onChange={(e) => setBusca(e.target.value)}
						className="pl-9"
					/>
				</div>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<Segmented
						label="Mostrar"
						size="sm"
						value={filtro}
						onChange={setFiltro}
						options={[
							{ value: "sem", label: `Sem turma (${semTurma})` },
							{ value: "todos", label: `Todos (${candidatos.length})` },
						]}
					/>
					{visiveis.length > 0 && (
						<Button variant="ghost" size="sm" onClick={alternarTodos}>
							{todosVisiveisMarcados ? "Desmarcar todos" : "Marcar todos"}
						</Button>
					)}
				</div>
			</div>

			{visiveis.length === 0 ? (
				<p className="py-10 text-center text-[13px] text-muted">
					{busca
						? "Nenhum inscrito encontrado."
						: filtro === "sem"
							? "Todos os inscritos já estão em turmas."
							: "Não há outros inscritos."}
				</p>
			) : (
				<ul className="m-0 flex list-none flex-col p-0">
					{visiveis.map((i) => {
						const outra = i.turmaId ? turmaPorId.get(i.turmaId) : undefined;
						const info = infoInscrito(i);
						return (
							<li key={i.id}>
								<label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar">
									<input
										type="checkbox"
										checked={selecionados.has(i.id)}
										onChange={() => alternar(i.id)}
										className="size-4 shrink-0 accent-accent"
									/>
									<span className="min-w-0 flex-1">
										<span className="block truncate font-medium">
											{nomeInscrito(i)}
										</span>
										{info && (
											<span className="block truncate text-xs text-muted">
												{info}
											</span>
										)}
									</span>
									{outra && (
										<TurmaTag nome={outra.nome} cor={outra.cor} className="max-w-[40%]" />
									)}
								</label>
							</li>
						);
					})}
				</ul>
			)}
		</Dialog>
	);
}
