import { useMemo } from "react";
import { useEncontrosStore } from "../../../stores/encontrosStore";
import { useInscricoesStore } from "../../../stores/inscricoesStore";
import { usePresencasStore } from "../../../stores/presencasStore";
import { useTurmasStore } from "../../../stores/turmasStore";
import type { Encontro } from "../../../types/encontro";
import { StatusPresenca } from "../../../types/enums";
import type { Inscricao } from "../../../types/inscricao";
import type { Presenca } from "../../../types/presenca";
import {
	calcularPercentualFrequencia,
	type ResumoStatusPresenca,
	resumirStatusPresencas,
} from "../../../utils/presenca";
import { chaveEncontro, compararPorNome } from "./formatos";

export interface FrequenciaMembro {
	inscrito: Inscricao;
	percentual: number | null;
	resumo: ResumoStatusPresenca;
}

/** Mapa encontroId → inscritoId → status (apenas membros atuais) */
export type MapaChamada = Map<string, Map<string, StatusPresenca>>;

/** Dados reativos da página de turma (atualizam a cada chamada) */
export function useDadosTurma(id: string) {
	const turma = useTurmasStore((s) => s.turmas.find((t) => t.id === id));
	const inscricoes = useInscricoesStore((s) => s.inscricoes);
	const todosEncontros = useEncontrosStore((s) => s.encontros);
	const presencas = usePresencasStore((s) => s.presencas);

	const membros = useMemo(
		() => inscricoes.filter((i) => i.turmaId === id).sort(compararPorNome),
		[inscricoes, id],
	);

	/** Em ordem cronológica */
	const encontros = useMemo<Encontro[]>(
		() =>
			todosEncontros
				.filter((e) => e.turmaId === id)
				.sort((a, b) => chaveEncontro(a).localeCompare(chaveEncontro(b))),
		[todosEncontros, id],
	);

	const { chamada, frequencias } = useMemo(() => {
		const idsMembros = new Set(membros.map((m) => m.id));
		const idsEncontros = new Set(encontros.map((e) => e.id));
		const chamada: MapaChamada = new Map(encontros.map((e) => [e.id, new Map()]));
		const porMembro = new Map<string, Presenca[]>();

		for (const p of presencas) {
			if (!idsEncontros.has(p.encontroId) || !idsMembros.has(p.inscritoId)) {
				continue;
			}
			chamada.get(p.encontroId)?.set(p.inscritoId, p.status);
			const lista = porMembro.get(p.inscritoId);
			if (lista) lista.push(p);
			else porMembro.set(p.inscritoId, [p]);
		}

		const frequencias = new Map<string, FrequenciaMembro>(
			membros.map((m) => {
				const doMembro = porMembro.get(m.id) ?? [];
				return [
					m.id,
					{
						inscrito: m,
						percentual: calcularPercentualFrequencia(doMembro),
						resumo: resumirStatusPresencas(doMembro),
					},
				];
			}),
		);
		return { chamada, frequencias };
	}, [membros, encontros, presencas]);

	return { turma, inscricoes, membros, encontros, chamada, frequencias };
}

export function statusDe(
	chamada: MapaChamada,
	encontroId: string,
	inscritoId: string,
): StatusPresenca {
	return chamada.get(encontroId)?.get(inscritoId) ?? StatusPresenca.PENDENTE;
}

export function contarChamada(
	chamada: MapaChamada,
	encontroId: string,
	membros: Inscricao[],
) {
	const contagem = { presente: 0, justificada: 0, falta: 0, pendente: 0 };
	for (const m of membros) {
		const status = statusDe(chamada, encontroId, m.id);
		if (status === StatusPresenca.PRESENTE) contagem.presente++;
		else if (status === StatusPresenca.FALTA_JUSTIFICADA) contagem.justificada++;
		else if (status === StatusPresenca.AUSENTE) contagem.falta++;
		else contagem.pendente++;
	}
	return contagem;
}
