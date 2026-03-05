import { Status } from "../types/enums";
import type { Inscricao } from "../types/inscricao";
import {
	obterCamposObrigatoriosAplicaveis,
	obterValor,
	temValor,
} from "./completude";

// Retorna a lista de labels dos campos faltantes (para completude — inclui pai/mãe completos)
export function listarCamposFaltantes(inscricao: Inscricao): string[] {
	const camposAplicaveis = obterCamposObrigatoriosAplicaveis(inscricao);
	return camposAplicaveis
		.filter((campo) => !temValor(obterValor(inscricao, campo.path)))
		.map((campo) => campo.label);
}

// Calcula o status automático com base APENAS nos campos que afetam status (afetaStatus !== false)
export function calcularStatus(inscricao: Inscricao): Status {
	const camposAplicaveis = obterCamposObrigatoriosAplicaveis(inscricao);
	const faltantesObrigatorios = camposAplicaveis.filter(
		(campo) => campo.afetaStatus !== false && !temValor(obterValor(inscricao, campo.path)),
	);
	return faltantesObrigatorios.length === 0 ? Status.CONCLUIDO : Status.PENDENTE;
}
