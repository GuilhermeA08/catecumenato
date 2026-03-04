import {
	CAMPOS_OBRIGATORIOS,
	type CampoConfig,
} from "../constants/camposObrigatorios";
import type { Inscricao } from "../types/inscricao";

// Busca valor aninhado por path como "crismando.nome"
export function obterValor(obj: unknown, path: string): unknown {
	return path.split(".").reduce((acc, key) => {
		if (acc !== null && acc !== undefined && typeof acc === "object") {
			return (acc as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj);
}

// Verifica se um valor é considerado "preenchido"
export function temValor(valor: unknown): boolean {
	if (valor === null || valor === undefined) return false;
	if (typeof valor === "string") return valor.trim().length > 0;
	if (typeof valor === "boolean") return true;
	return true;
}

// Retorna os campos obrigatórios aplicáveis para uma inscrição
export function obterCamposObrigatoriosAplicaveis(
	inscricao: Inscricao,
): CampoConfig[] {
	return CAMPOS_OBRIGATORIOS.filter((campo) => {
		if (campo.condicao) {
			return campo.condicao(inscricao);
		}
		return true;
	});
}

// Calcula o percentual de completude (0-100)
export function calcularCompletude(inscricao: Inscricao): number {
	const camposAplicaveis = obterCamposObrigatoriosAplicaveis(inscricao);
	if (camposAplicaveis.length === 0) return 100;

	const preenchidos = camposAplicaveis.filter((campo) => {
		const valor = obterValor(inscricao, campo.path);
		return temValor(valor);
	});

	return Math.round((preenchidos.length / camposAplicaveis.length) * 100);
}
