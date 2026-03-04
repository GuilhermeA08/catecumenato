import Papa from "papaparse";
import { COLUNAS_CSV, ORDEM_COLUNAS_CSV } from "../../../constants/colunasCSV";
import type { Inscricao } from "../../../types/inscricao";
import type { Turma } from "../../../types/turma";
import {
	calcularStatus,
	listarCamposFaltantes,
} from "../../../utils/camposFaltantes";
import { calcularCompletude, obterValor } from "../../../utils/completude";

// Define o valor em um objeto aninhado dado um path "secao.campo"
function definirValor(
	obj: Record<string, unknown>,
	path: string,
	valor: unknown,
): void {
	const partes = path.split(".");
	let atual = obj;
	for (let i = 0; i < partes.length - 1; i++) {
		const chave = partes[i] ?? "";
		if (
			atual[chave] === undefined ||
			atual[chave] === null ||
			typeof atual[chave] !== "object"
		) {
			atual[chave] = {};
		}
		atual = atual[chave] as Record<string, unknown>;
	}
	atual[partes[partes.length - 1] ?? ""] = valor;
}

// Normaliza valores booleanos de strings como "SIM", "S", "Sim", ...
function parsearBooleano(valor: string | null | undefined): boolean | null {
	if (!valor || valor.trim() === "") return null;
	const v = valor.trim().toUpperCase();
	if (["SIM", "S", "TRUE", "1", "X"].includes(v)) return true;
	if (["NÃO", "NAO", "N", "FALSE", "0"].includes(v)) return false;
	return null;
}

// Normaliza string (trim + null se vazio)
function normalizar(valor: unknown): string | null {
	if (valor === null || valor === undefined) return null;
	const str = String(valor).trim();
	return str.length > 0 ? str : null;
}

// Converte uma linha do CSV para a interface Inscricao
function linhaParaInscricao(linha: Record<string, unknown>): Inscricao {
	const parcial: Record<string, unknown> = {
		crismando: {},
		pai: {},
		mae: {},
		padrinho: {},
		controle: {},
	};

	for (const [coluna, path] of Object.entries(COLUNAS_CSV)) {
		const valorBruto = linha[coluna];

		// Campos booleanos
		if (
			path === "crismando.batizado" ||
			path === "crismando.fezPrimeiraEucaristia"
		) {
			definirValor(parcial, path, parsearBooleano(normalizar(valorBruto)));
		} else {
			definirValor(parcial, path, normalizar(valorBruto));
		}
	}

	const inscricaoBase = parcial as unknown as Omit<
		Inscricao,
		| "id"
		| "status"
		| "statusOverride"
		| "completude"
		| "camposFaltantes"
		| "atualizadoEm"
	>;
	const inscricaoComId = {
		...inscricaoBase,
		id: crypto.randomUUID(),
		statusOverride: false,
		atualizadoEm: new Date().toISOString(),
	} as Inscricao;

	const campos = listarCamposFaltantes(inscricaoComId);
	const completude = calcularCompletude(inscricaoComId);
	const status = calcularStatus(inscricaoComId);

	return {
		...inscricaoComId,
		status,
		completude,
		camposFaltantes: campos,
	};
}

// Parse de arquivo CSV → lista de Inscricao
// resolverTurma: recebe o nome da turma e retorna o turmaId (cria se necessário)
export async function parseCSV(
	file: File,
	resolverTurma?: (nome: string) => string,
): Promise<{ inscricoes: Inscricao[]; erros: string[] }> {
	return new Promise((resolve) => {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			transformHeader: (header) =>
				header.trim().toUpperCase().replace(/\s+/g, "_"),
			complete: (results) => {
				const erros: string[] = [];
				const inscricoes: Inscricao[] = [];

				const dados = results.data as Record<string, unknown>[];

				dados.forEach((linha, idx) => {
					try {
						const inscricao = linhaParaInscricao(linha);
						// Resolver turma pelo nome na coluna TURMA
						const nomeTurma = normalizar(linha["TURMA"]);
						if (nomeTurma && resolverTurma) {
							inscricao.turmaId = resolverTurma(nomeTurma);
						}
						inscricoes.push(inscricao);
					} catch (e) {
						erros.push(
							`Linha ${idx + 2}: ${e instanceof Error ? e.message : "Erro desconhecido"}`,
						);
					}
				});

				if (results.errors.length > 0) {
					results.errors.forEach((err) => {
						erros.push(`Parse error linha ${err.row}: ${err.message}`);
					});
				}

				resolve({ inscricoes, erros });
			},
			error: (error) => {
				resolve({ inscricoes: [], erros: [error.message] });
			},
		});
	});
}

// Converte lista de inscrições de volta para CSV e dispara download
export function exportarCSV(
	inscricoes: Inscricao[],
	turmas: Turma[] = [],
): void {
	const turmaMap = new Map(turmas.map((t) => [t.id, t.nome]));

	const colunasExport = ["TURMA", "STATUS", ...ORDEM_COLUNAS_CSV];

	const linhas = inscricoes.map((inscricao) => {
		const linha: Record<string, string> = {};

		// Turma
		linha["TURMA"] = inscricao.turmaId
			? (turmaMap.get(inscricao.turmaId) ?? inscricao.turmaId)
			: "";

		// Status
		linha["STATUS"] =
			inscricao.status === "concluido" ? "Concluído" : "Pendente";

		for (const coluna of ORDEM_COLUNAS_CSV) {
			const path = COLUNAS_CSV[coluna] ?? "";
			const valor = obterValor(inscricao, path);

			if (valor === null || valor === undefined) {
				linha[coluna] = "";
			} else if (typeof valor === "boolean") {
				linha[coluna] = valor ? "Sim" : "Não";
			} else {
				linha[coluna] = String(valor);
			}
		}
		return linha;
	});

	const csv = Papa.unparse(linhas, {
		columns: colunasExport,
	});

	const hoje = new Date().toISOString().split("T")[0];
	const nomeArquivo = `inscricoes_crisma_${hoje}.csv`;

	const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", nomeArquivo);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

// Recalcula metadados de uma inscrição (status, completude, camposFaltantes)
export function recalcularInscricao(inscricao: Inscricao): Inscricao {
	const campos = listarCamposFaltantes(inscricao);
	const completude = calcularCompletude(inscricao);
	const status = inscricao.statusOverride
		? inscricao.status
		: calcularStatus(inscricao);

	return {
		...inscricao,
		camposFaltantes: campos,
		completude,
		status,
		atualizadoEm: new Date().toISOString(),
	};
}

// Gera CSV de modelo para download (template vazio)
export function exportarTemplate(): void {
	const csv = Papa.unparse({ fields: ORDEM_COLUNAS_CSV, data: [] });
	const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", "modelo_inscricoes_crisma.csv");
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
