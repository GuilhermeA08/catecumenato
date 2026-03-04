import { Status } from "../types/enums";
import type { Inscricao } from "../types/inscricao";
import {
	obterCamposObrigatoriosAplicaveis,
	obterValor,
	temValor,
} from "./completude";

// Retorna a lista de labels dos campos faltantes
export function listarCamposFaltantes(inscricao: Inscricao): string[] {
	const camposAplicaveis = obterCamposObrigatoriosAplicaveis(inscricao);
	return camposAplicaveis
		.filter((campo) => !temValor(obterValor(inscricao, campo.path)))
		.map((campo) => campo.label);
}

// Calcula o status automático com base nos campos faltantes
export function calcularStatus(inscricao: Inscricao): Status {
	const faltantes = listarCamposFaltantes(inscricao);
	return faltantes.length === 0 ? Status.CONCLUIDO : Status.PENDENTE;
}
