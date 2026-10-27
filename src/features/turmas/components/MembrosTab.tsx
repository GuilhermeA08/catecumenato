import { Link } from "@tanstack/react-router";
import { Search, UserMinus, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { controlClasses, Input } from "../../../components/ui/Input";
import { Avatar, EmptyState } from "../../../components/ui/misc";
import { toast } from "../../../components/ui/Toast";
import { vincularTurma } from "../../../stores/acoes";
import { useTurmasStore } from "../../../stores/turmasStore";
import type { Inscricao } from "../../../types/inscricao";
import type { Turma } from "../../../types/turma";
import { cn } from "../../../utils/cn";
import { infoInscrito, nomeInscrito, normalizarBusca, plural } from "./formatos";

export function MembrosTab({
	turma,
	membros,
	disponiveis,
	onAdicionar,
}: {
	turma: Turma;
	membros: Inscricao[];
	/** Inscritos sem turma */
	disponiveis: number;
	onAdicionar: () => void;
}) {
	const turmas = useTurmasStore((s) => s.turmas);
	const [busca, setBusca] = useState("");

	const filtrados = useMemo(() => {
		const q = normalizarBusca(busca);
		if (!q) return membros;
		return membros.filter((m) => normalizarBusca(nomeInscrito(m)).includes(q));
	}, [membros, busca]);

	function mover(inscrito: Inscricao, turmaId: string) {
		vincularTurma(inscrito.id, turmaId || null);
		const destino = turmas.find((t) => t.id === turmaId);
		toast.sucesso(
			destino
				? `${nomeInscrito(inscrito)} foi para “${destino.nome}”.`
				: `${nomeInscrito(inscrito)} ficou sem turma.`,
		);
	}

	if (membros.length === 0) {
		return (
			<Card>
				<EmptyState
					icon={<Users />}
					title="Nenhum membro nesta turma"
					action={
						<Button onClick={onAdicionar}>
							<UserPlus />
							Adicionar membros
						</Button>
					}
				>
					{disponiveis > 0
						? `${plural(disponiveis, "inscrito está", "inscritos estão")} sem turma.`
						: "Você pode trazer inscritos de outras turmas."}
				</EmptyState>
			</Card>
		);
	}

	return (
		<Card className="overflow-hidden">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
				<div className="relative min-w-0 flex-[1_1_220px] sm:max-w-xs">
					<Search
						className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
						aria-hidden="true"
					/>
					<Input
						type="search"
						aria-label="Filtrar membros por nome"
						placeholder="Filtrar membros…"
						value={busca}
						onChange={(e) => setBusca(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Button onClick={onAdicionar}>
					<UserPlus />
					Adicionar membros
				</Button>
			</div>

			{filtrados.length === 0 ? (
				<p className="px-6 py-10 text-center text-[13px] text-muted">
					Nenhum membro encontrado para “{busca}”.
				</p>
			) : (
				<ul className="m-0 list-none p-0">
					{filtrados.map((m) => {
						const nome = nomeInscrito(m);
						const info = infoInscrito(m);
						return (
							<li
								key={m.id}
								className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line/60 px-5 py-2.5 first:border-t-0 sm:px-6"
							>
								<Avatar nome={m.crismando.nome} size="sm" />
								<div className="min-w-0 flex-[1_1_180px]">
									<Link
										to="/inscritos/$id"
										params={{ id: m.id }}
										className="block truncate font-medium text-ink no-underline hover:text-accent"
									>
										{nome}
									</Link>
									{info && <p className="truncate text-xs text-muted">{info}</p>}
								</div>
								<div className="flex items-center gap-1">
									<select
										aria-label={`Turma de ${nome}`}
										value={turma.id}
										onChange={(e) => mover(m, e.target.value)}
										className={cn(controlClasses, "h-8 w-auto max-w-44 pr-7 text-[13px]")}
									>
										{turmas.map((t) => (
											<option key={t.id} value={t.id}>
												{t.nome}
											</option>
										))}
										<option value="">Sem turma</option>
									</select>
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={() => mover(m, "")}
										aria-label={`Remover ${nome} da turma`}
										title="Remover da turma"
										className="hover:bg-danger-soft hover:text-danger-ink"
									>
										<UserMinus />
									</Button>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			{disponiveis > 0 && (
				<p className="border-t border-line px-5 py-3 text-[13px] text-muted sm:px-6">
					{plural(disponiveis, "inscrito ainda sem turma", "inscritos ainda sem turma")}{" "}
					·{" "}
					<button
						type="button"
						onClick={onAdicionar}
						className="cursor-pointer font-medium text-accent hover:text-accent-hover"
					>
						adicionar a esta turma
					</button>
				</p>
			)}
		</Card>
	);
}
