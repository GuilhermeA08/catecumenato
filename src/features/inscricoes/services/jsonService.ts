import { useEncontrosStore } from "../../../stores/encontrosStore";
import { useInscricoesStore } from "../../../stores/inscricoesStore";
import { usePresencasStore } from "../../../stores/presencasStore";
import { useTurmasStore } from "../../../stores/turmasStore";
import type { Encontro } from "../../../types/encontro";
import type { Inscricao } from "../../../types/inscricao";
import type { Presenca } from "../../../types/presenca";
import type { Turma } from "../../../types/turma";
import { recalcularInscricao } from "./csvService";

export interface DadosExportacao {
	versao: number;
	exportadoEm: string;
	turmas: Turma[];
	inscricoes: Inscricao[];
	encontros: Encontro[];
	presencas: Presenca[];
}

const VERSAO = 1;

export function exportarJSON(): void {
	const turmas = useTurmasStore.getState().turmas;
	const inscricoes = useInscricoesStore.getState().inscricoes;
	const encontros = useEncontrosStore.getState().encontros;
	const presencas = usePresencasStore.getState().presencas;

	const dados: DadosExportacao = {
		versao: VERSAO,
		exportadoEm: new Date().toISOString(),
		turmas,
		inscricoes,
		encontros,
		presencas,
	};

	const json = JSON.stringify(dados, null, 2);
	const hoje = new Date().toISOString().split("T")[0];
	const nomeArquivo = `catecumenato_backup_${hoje}.json`;

	const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", nomeArquivo);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
	registrarBackup();
}

export type ResultadoLeituraBackup =
	| { sucesso: true; dados: DadosExportacao }
	| { sucesso: false; mensagem: string };

const ehObjeto = (v: unknown): v is Record<string, unknown> =>
	typeof v === "object" && v !== null;

function validarBackup(dados: unknown): string | null {
	if (!ehObjeto(dados) || typeof dados.versao !== "number") {
		return "Arquivo inválido: não parece um backup do Catecumenato.";
	}
	for (const chave of ["turmas", "inscricoes", "encontros", "presencas"]) {
		if (!Array.isArray(dados[chave])) return `Arquivo inválido: falta "${chave}".`;
	}
	const d = dados as unknown as DadosExportacao;
	if (!d.turmas.every((t) => ehObjeto(t) && typeof t.id === "string" && typeof t.nome === "string"))
		return "Arquivo inválido: turmas com formato inesperado.";
	if (!d.inscricoes.every((i) => ehObjeto(i) && typeof i.id === "string" && ehObjeto(i.crismando)))
		return "Arquivo inválido: inscrições com formato inesperado.";
	if (!d.encontros.every((e) => ehObjeto(e) && typeof e.id === "string" && typeof e.turmaId === "string"))
		return "Arquivo inválido: encontros com formato inesperado.";
	if (!d.presencas.every((p) => ehObjeto(p) && typeof p.encontroId === "string" && typeof p.inscritoId === "string"))
		return "Arquivo inválido: presenças com formato inesperado.";
	return null;
}

/** Lê e valida o arquivo de backup, sem alterar nenhum dado */
export async function lerBackupJSON(file: File): Promise<ResultadoLeituraBackup> {
	try {
		const dados: unknown = JSON.parse(await file.text());
		const erro = validarBackup(dados);
		if (erro) return { sucesso: false, mensagem: erro };
		return { sucesso: true, dados: dados as DadosExportacao };
	} catch (erro) {
		return {
			sucesso: false,
			mensagem: `Erro ao ler arquivo: ${erro instanceof Error ? erro.message : "erro desconhecido"}`,
		};
	}
}

/** Substitui todos os dados pelos do backup (já validado por lerBackupJSON) */
export function restaurarBackup(dados: DadosExportacao): void {
	const inscricoes = dados.inscricoes.map((i) =>
		recalcularInscricao({
			...i,
			turmaId: i.turmaId ?? null,
			statusOverride: i.statusOverride ?? false,
		}),
	);
	useTurmasStore.setState({ turmas: dados.turmas });
	useEncontrosStore.setState({ encontros: dados.encontros });
	usePresencasStore.setState({ presencas: dados.presencas });
	useInscricoesStore.getState().setInscricoes(inscricoes);
	registrarBackup();
}

// ── Lembrete de backup ────────────────────────────────────────

const CHAVE_ULTIMO_BACKUP = "catecumenato-ultimo-backup";

function registrarBackup(): void {
	try {
		localStorage.setItem(CHAVE_ULTIMO_BACKUP, new Date().toISOString());
	} catch {
		// armazenamento indisponível: o lembrete apenas não é atualizado
	}
}

export function obterUltimoBackup(): string | null {
	try {
		return localStorage.getItem(CHAVE_ULTIMO_BACKUP);
	} catch {
		return null;
	}
}
