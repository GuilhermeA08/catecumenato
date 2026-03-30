import { StatusPresenca } from "../types/enums";
import type { Presenca } from "../types/presenca";

export interface ResumoStatusPresenca {
	presente: number;
	ausente: number;
	faltaJustificada: number;
	pendente: number;
	total: number;
}

export function resumirStatusPresencas(
	presencas: Presenca[],
): ResumoStatusPresenca {
	const resumo: ResumoStatusPresenca = {
		presente: 0,
		ausente: 0,
		faltaJustificada: 0,
		pendente: 0,
		total: presencas.length,
	};

	for (const presenca of presencas) {
		switch (presenca.status) {
			case StatusPresenca.PRESENTE:
				resumo.presente += 1;
				break;
			case StatusPresenca.AUSENTE:
				resumo.ausente += 1;
				break;
			case StatusPresenca.FALTA_JUSTIFICADA:
				resumo.faltaJustificada += 1;
				break;
			default:
				resumo.pendente += 1;
		}
	}

	return resumo;
}

export function calcularPercentualFrequencia(
	presencas: Presenca[],
	incluirJustificada = false,
): number {
	if (presencas.length === 0) return 0;

	const presencasValidas = presencas.filter((p) =>
		incluirJustificada
			? p.status === StatusPresenca.PRESENTE ||
				p.status === StatusPresenca.FALTA_JUSTIFICADA
			: p.status === StatusPresenca.PRESENTE,
	);

	return Math.round((presencasValidas.length / presencas.length) * 100);
}
