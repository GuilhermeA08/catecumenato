/**
 * Operações que envolvem mais de um store.
 * As telas devem usar estas funções em vez dos primitivos dos stores
 * para manter os dados consistentes (sem presenças/encontros órfãos).
 */
import { recalcularInscricao } from "../features/inscricoes/services/csvService";
import { StatusPresenca } from "../types/enums";
import type { Inscricao } from "../types/inscricao";
import { useEncontrosStore } from "./encontrosStore";
import { useInscricoesStore } from "./inscricoesStore";
import { usePresencasStore } from "./presencasStore";
import { useTurmasStore } from "./turmasStore";

export function excluirInscricao(id: string): void {
	useInscricoesStore.getState().excluirInscricao(id);
	usePresencasStore.getState().removerPorInscrito(id);
}

export function excluirEncontro(id: string): void {
	useEncontrosStore.getState().excluirEncontro(id);
}

/** Exclui a turma, seus encontros/presenças e desvincula os membros */
export function excluirTurma(id: string): void {
	const encontros = useEncontrosStore.getState().getByTurma(id);
	for (const encontro of encontros) {
		useEncontrosStore.getState().excluirEncontro(encontro.id);
	}
	useInscricoesStore.setState((state) => ({
		inscricoes: state.inscricoes.map((i) =>
			i.turmaId === id ? { ...i, turmaId: null } : i,
		),
	}));
	useTurmasStore.getState().excluirTurma(id);
}

/**
 * Move o inscrito para outra turma.
 * Remove as presenças ainda não registradas da turma antiga (o histórico
 * já registrado é mantido) e cria presenças pendentes nos encontros da nova.
 */
export function vincularTurma(inscritoId: string, turmaId: string | null): void {
	const inscricao = useInscricoesStore.getState().getById(inscritoId);
	if (!inscricao || inscricao.turmaId === turmaId) return;

	const presencas = usePresencasStore.getState();
	const encontros = useEncontrosStore.getState();

	if (inscricao.turmaId) {
		const antigos = new Set(
			encontros.getByTurma(inscricao.turmaId).map((e) => e.id),
		);
		const pendentesAntigos = presencas
			.getByInscrito(inscritoId)
			.filter(
				(p) => antigos.has(p.encontroId) && p.status === StatusPresenca.PENDENTE,
			)
			.map((p) => p.encontroId);
		if (pendentesAntigos.length > 0) {
			presencas.removerPorInscrito(inscritoId, pendentesAntigos);
		}
	}

	useInscricoesStore.getState().vincularTurma(inscritoId, turmaId);

	if (turmaId) {
		const jaRegistrados = new Set(
			presencas.getByInscrito(inscritoId).map((p) => p.encontroId),
		);
		for (const encontro of encontros.getByTurma(turmaId)) {
			if (jaRegistrados.has(encontro.id)) continue;
			usePresencasStore
				.getState()
				.definirStatus(encontro.id, inscritoId, StatusPresenca.PENDENTE);
		}
	}
}

/** Apaga todos os dados do navegador (os 4 stores) */
export function limparTudo(): void {
	useInscricoesStore.getState().limpar();
	useTurmasStore.getState().limpar();
	useEncontrosStore.getState().limpar();
	usePresencasStore.getState().limpar();
}

// ── Importação ────────────────────────────────────────────────

function normalizarNome(nome: string | null | undefined): string {
	return (nome ?? "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

function chaveInscricao(i: Inscricao): string {
	return `${normalizarNome(i.crismando.nome)}|${(i.crismando.dataNascimento ?? "").trim()}`;
}

export interface PreviaImportacao {
	atualizados: number;
	novos: number;
	ignorados: number;
}

/** Calcula o efeito de mesclar `novas` sobre `existentes`, sem alterar nada */
export function previaImportacao(
	existentes: Inscricao[],
	novas: Inscricao[],
): PreviaImportacao {
	const validas = novas.filter((i) => normalizarNome(i.crismando.nome));
	const casadas = mesclarInscricoes(existentes, validas).casadas;
	return {
		atualizados: casadas,
		novos: validas.length - casadas,
		ignorados: novas.length - validas.length,
	};
}

/**
 * Mescla inscrições importadas nas existentes.
 * Casa por nome normalizado + data de nascimento; se a data faltar em um dos
 * lados, casa só pelo nome quando ele for único. Mantém id, turma (se o CSV
 * não trouxer) e status manual dos registros existentes.
 */
export function mesclarInscricoes(
	existentes: Inscricao[],
	novas: Inscricao[],
): { resultado: Inscricao[]; casadas: number } {
	const porChave = new Map<string, Inscricao>();
	const porNome = new Map<string, Inscricao[]>();
	for (const e of existentes) {
		porChave.set(chaveInscricao(e), e);
		const nome = normalizarNome(e.crismando.nome);
		porNome.set(nome, [...(porNome.get(nome) ?? []), e]);
	}

	const usados = new Set<string>();
	const resultado = new Map(existentes.map((e) => [e.id, e]));
	let casadas = 0;

	for (const nova of novas) {
		let alvo = porChave.get(chaveInscricao(nova));
		if (!alvo) {
			const candidatos = porNome.get(normalizarNome(nova.crismando.nome)) ?? [];
			if (
				candidatos.length === 1 &&
				(!candidatos[0]?.crismando.dataNascimento ||
					!nova.crismando.dataNascimento)
			) {
				alvo = candidatos[0];
			}
		}

		if (alvo && !usados.has(alvo.id)) {
			usados.add(alvo.id);
			casadas++;
			resultado.set(
				alvo.id,
				recalcularInscricao({
					...nova,
					id: alvo.id,
					turmaId: nova.turmaId ?? alvo.turmaId,
					status: nova.statusOverride ? nova.status : alvo.status,
					statusOverride: nova.statusOverride || alvo.statusOverride,
				}),
			);
		} else {
			resultado.set(nova.id, nova);
		}
	}

	return { resultado: [...resultado.values()], casadas };
}

export function aplicarImportacao(
	novas: Inscricao[],
	modo: "mesclar" | "substituir",
): void {
	const validas = novas.filter((i) => normalizarNome(i.crismando.nome));
	if (validas.length === 0) return;

	const store = useInscricoesStore.getState();
	if (modo === "substituir") {
		const idsNovos = new Set(validas.map((i) => i.id));
		for (const antiga of store.inscricoes) {
			if (!idsNovos.has(antiga.id)) {
				usePresencasStore.getState().removerPorInscrito(antiga.id);
			}
		}
		store.setInscricoes(validas);
		return;
	}

	store.setInscricoes(mesclarInscricoes(store.inscricoes, validas).resultado);
}
