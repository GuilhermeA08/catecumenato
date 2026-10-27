import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useEncontrosStore } from "../../stores/encontrosStore";
import { usePresencasStore } from "../../stores/presencasStore";
import { StatusPresenca } from "../../types/enums";
import type { Inscricao } from "../../types/inscricao";
import { calcularPercentualFrequencia } from "../../utils/presenca";
import { COR_PRESENCA, ROTULO_PRESENCA } from "../encontro/PresencaBadge";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Segmented } from "../ui/misc";

const OPCOES = [
	{
		value: StatusPresenca.PRESENTE,
		label: "Presente",
		activeClassName: "bg-ok font-medium text-white",
	},
	{
		value: StatusPresenca.FALTA_JUSTIFICADA,
		label: "Justificada",
		activeClassName:
			"bg-surface font-medium text-warn-ink shadow-thumb",
	},
	{
		value: StatusPresenca.AUSENTE,
		label: "Falta",
		activeClassName: "bg-danger font-medium text-white",
	},
];

function dataCurta(iso: string): string {
	const [, mes, dia] = iso.split("-");
	return `${dia}/${mes}`;
}

function dataLonga(iso: string): string {
	return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", {
		weekday: "short",
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function plural(n: number, singular: string, pluralTxt: string) {
	return `${n} ${n === 1 ? singular : pluralTxt}`;
}

/** Frequência do inscrito nos encontros da turma, com edição da presença */
export function FrequenciaInscrito({ inscricao }: { inscricao: Inscricao }) {
	const encontros = useEncontrosStore((s) => s.encontros);
	const presencas = usePresencasStore((s) => s.presencas);
	const definirStatus = usePresencasStore((s) => s.definirStatus);

	const dados = useMemo(() => {
		const daTurma = encontros
			.filter((e) => e.turmaId === inscricao.turmaId)
			.sort((a, b) =>
				`${a.dataEncontro} ${a.horarioInicio}`.localeCompare(
					`${b.dataEncontro} ${b.horarioInicio}`,
				),
			);
		const ids = new Set(daTurma.map((e) => e.id));
		const minhas = presencas.filter(
			(p) => p.inscritoId === inscricao.id && ids.has(p.encontroId),
		);
		const porEncontro = new Map(minhas.map((p) => [p.encontroId, p.status]));
		const itens = daTurma.map((encontro) => ({
			encontro,
			status: porEncontro.get(encontro.id) ?? StatusPresenca.PENDENTE,
		}));
		const contar = (s: StatusPresenca) =>
			itens.filter((i) => i.status === s).length;
		return {
			itens,
			percentual: calcularPercentualFrequencia(minhas),
			presentes: contar(StatusPresenca.PRESENTE),
			justificadas: contar(StatusPresenca.FALTA_JUSTIFICADA),
			faltas: contar(StatusPresenca.AUSENTE),
			pendentes: contar(StatusPresenca.PENDENTE),
		};
	}, [encontros, presencas, inscricao.id, inscricao.turmaId]);

	const vazio = !inscricao.turmaId
		? "Sem turma vinculada. Escolha uma turma no topo da ficha para acompanhar a frequência."
		: dados.itens.length === 0
			? "Nenhum encontro cadastrado para esta turma ainda."
			: null;

	return (
		<Card>
			<CardHeader
				title="Frequência"
				actions={
					!vazio && (
						<span className="font-serif text-2xl leading-none tabular-nums">
							{dados.percentual === null ? "—" : `${dados.percentual}%`}
						</span>
					)
				}
			/>
			<CardContent className="flex flex-col gap-4">
				{vazio ? (
					<p className="text-[13px] text-muted">
						{vazio}{" "}
						{inscricao.turmaId && (
							<Link
								to="/turmas/$id"
								params={{ id: inscricao.turmaId }}
								className="text-accent"
							>
								Ir para a turma
							</Link>
						)}
					</p>
				) : (
					<>
						<ul aria-label="Presença por encontro" className="flex flex-wrap gap-1">
							{dados.itens.map(({ encontro, status }) => {
								const descricao = `${dataCurta(encontro.dataEncontro)} · ${ROTULO_PRESENCA[status]}`;
								return (
									<li
										key={encontro.id}
										title={descricao}
										className="h-[22px] min-w-3.5 flex-1 rounded"
										style={{ backgroundColor: COR_PRESENCA[status], maxWidth: 40 }}
									>
										<span className="sr-only">{descricao}</span>
									</li>
								);
							})}
						</ul>
						<div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-muted">
							<span>{plural(dados.presentes, "presença", "presenças")}</span>
							<span>{plural(dados.justificadas, "justificada", "justificadas")}</span>
							<span>{plural(dados.faltas, "falta", "faltas")}</span>
							{dados.pendentes > 0 && (
								<span>{plural(dados.pendentes, "sem marcação", "sem marcação")}</span>
							)}
						</div>

						<div className="border-t border-line pt-3">
							<h3 className="mb-2 text-[13px] font-medium text-ink-2">
								Registrar presença
							</h3>
							<ul className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
								{[...dados.itens].reverse().map(({ encontro, status }) => (
									<li key={encontro.id} className="flex flex-col gap-1.5">
										<div className="text-[13px]">
											<span className="font-medium text-ink">
												{dataLonga(encontro.dataEncontro)}
											</span>
											<span className="text-muted">
												{" · "}
												{encontro.horarioInicio}
												{encontro.local ? ` · ${encontro.local}` : ""}
											</span>
										</div>
										<Segmented
											size="sm"
											label={`Presença em ${dataLonga(encontro.dataEncontro)}`}
											value={status}
											onChange={(novo) =>
												definirStatus(encontro.id, inscricao.id, novo)
											}
											options={OPCOES}
											className="self-start"
										/>
									</li>
								))}
							</ul>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
