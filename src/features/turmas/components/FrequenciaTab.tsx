import { Link } from "@tanstack/react-router";
import { ChartColumn } from "lucide-react";
import { useMemo } from "react";
import { Card, CardHeader } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/misc";
import { cn } from "../../../utils/cn";
import { compararPorNome, nomeInscrito } from "./formatos";
import type { FrequenciaMembro } from "./useDadosTurma";

const LIMITE = 75;

export function FrequenciaTab({
	frequencias,
	encontrosComChamada,
}: {
	frequencias: FrequenciaMembro[];
	encontrosComChamada: number;
}) {
	const ordenadas = useMemo(
		() =>
			[...frequencias].sort((a, b) => {
				if (a.percentual === b.percentual) {
					return compararPorNome(a.inscrito, b.inscrito);
				}
				if (a.percentual === null) return 1;
				if (b.percentual === null) return -1;
				return a.percentual - b.percentual;
			}),
		[frequencias],
	);
	const abaixo = ordenadas.filter(
		(f) => f.percentual !== null && f.percentual < LIMITE,
	).length;

	if (frequencias.length === 0 || encontrosComChamada === 0) {
		return (
			<Card>
				<EmptyState icon={<ChartColumn />} title="Sem frequência para mostrar">
					{frequencias.length === 0
						? "A turma ainda não tem membros."
						: "Registre a chamada de um encontro para ver a frequência de cada membro."}
				</EmptyState>
			</Card>
		);
	}

	return (
		<Card className="overflow-hidden">
			<CardHeader
				title="Frequência por membro"
				description={
					<>
						Justificadas contam como presença · {encontrosComChamada}{" "}
						{encontrosComChamada === 1 ? "encontro" : "encontros"} com chamada
						{abaixo > 0 && (
							<>
								{" · "}
								<span className="font-medium text-danger-ink">
									{abaixo} abaixo de {LIMITE}%
								</span>
							</>
						)}
					</>
				}
			/>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[480px] border-collapse text-sm">
					<thead>
						<tr className="border-y border-line text-left text-xs text-muted">
							<th scope="col" className="px-5 py-2 font-medium sm:px-6">
								Membro
							</th>
							<th scope="col" className="w-[36%] px-3 py-2 font-medium">
								Frequência
							</th>
							<th scope="col" className="w-12 px-2 py-2 text-center font-medium">
								<abbr title="Presenças" className="no-underline">P</abbr>
							</th>
							<th scope="col" className="w-12 px-2 py-2 text-center font-medium">
								<abbr title="Faltas justificadas" className="no-underline">J</abbr>
							</th>
							<th scope="col" className="w-12 px-2 py-2 pr-5 text-center font-medium sm:pr-6">
								<abbr title="Faltas" className="no-underline">F</abbr>
							</th>
						</tr>
					</thead>
					<tbody>
						{ordenadas.map(({ inscrito, percentual, resumo }) => {
							const baixa = percentual !== null && percentual < LIMITE;
							return (
								<tr
									key={inscrito.id}
									className={cn(
										"border-t border-line/60 first:border-t-0",
										baixa && "bg-danger-soft/50",
									)}
								>
									<th scope="row" className="px-5 py-2.5 text-left font-medium sm:px-6">
										<Link
											to="/inscritos/$id"
											params={{ id: inscrito.id }}
											className="text-ink no-underline hover:text-accent"
										>
											{nomeInscrito(inscrito)}
										</Link>
									</th>
									<td className="px-3 py-2.5">
										{percentual === null ? (
											<span className="text-xs text-subtle">sem chamada</span>
										) : (
											<div className="flex items-center gap-2.5">
												<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand" aria-hidden="true">
													<div
														className={cn("h-full rounded-full", baixa ? "bg-danger" : "bg-ok")}
														style={{ width: `${percentual}%` }}
													/>
												</div>
												<span
													className={cn(
														"w-10 text-right text-xs font-medium tabular-nums",
														baixa ? "text-danger-ink" : "text-ink-2",
													)}
												>
													{percentual}%
												</span>
											</div>
										)}
									</td>
									<td className="px-2 py-2.5 text-center tabular-nums text-ok-ink">
										{resumo.presente}
									</td>
									<td className="px-2 py-2.5 text-center tabular-nums text-warn-ink">
										{resumo.faltaJustificada}
									</td>
									<td className="px-2 py-2.5 pr-5 text-center tabular-nums text-danger-ink sm:pr-6">
										{resumo.ausente}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</Card>
	);
}
