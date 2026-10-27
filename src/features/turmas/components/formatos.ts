import type { Encontro } from "../../../types/encontro";
import type { Inscricao } from "../../../types/inscricao";
import { calcularIdade } from "../../../utils/mascaras";

export function dataLocal(dataIso: string): Date {
	return new Date(`${dataIso}T00:00:00`);
}

/** dd/mm */
export function formatarDiaMes(dataIso: string): string {
	return dataLocal(dataIso).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
	});
}

/** dd/mm/aaaa */
export function formatarDataCompleta(dataIso: string): string {
	return dataLocal(dataIso).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

/** "sáb" */
export function formatarDiaSemana(dataIso: string): string {
	return dataLocal(dataIso)
		.toLocaleDateString("pt-BR", { weekday: "short" })
		.replace(".", "");
}

export function hojeIso(): string {
	const d = new Date();
	const mes = String(d.getMonth() + 1).padStart(2, "0");
	const dia = String(d.getDate()).padStart(2, "0");
	return `${d.getFullYear()}-${mes}-${dia}`;
}

export function chaveEncontro(e: Encontro): string {
	return `${e.dataEncontro} ${e.horarioInicio}`;
}

export function horarioEncontro(e: Encontro): string {
	return e.horarioFim ? `${e.horarioInicio} às ${e.horarioFim}` : e.horarioInicio;
}

export function nomeInscrito(i: Inscricao): string {
	return i.crismando.nome?.trim() || "(sem nome)";
}

export function compararPorNome(a: Inscricao, b: Inscricao): number {
	return nomeInscrito(a).localeCompare(nomeInscrito(b), "pt-BR", {
		sensitivity: "base",
	});
}

/** "15 anos · Sábado – 08:00" */
export function infoInscrito(i: Inscricao): string {
	const idade = calcularIdade(i.crismando.dataNascimento);
	return [
		idade !== null ? `${idade} anos` : null,
		[i.crismando.diaEncontro, i.crismando.horario].filter(Boolean).join(" – ") ||
			null,
	]
		.filter(Boolean)
		.join(" · ");
}

export function normalizarBusca(texto: string): string {
	return texto
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.trim();
}

export function plural(n: number, singular: string, pluralForma: string): string {
	return `${n} ${n === 1 ? singular : pluralForma}`;
}
