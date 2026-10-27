import { create } from "zustand";
import { gerarId } from "../utils/id";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Turma } from "../types/turma";

/**
 * Paleta das turmas: parte do azul da marca, alterna análogos (índigo,
 * petróleo, ardósia) com complementares quentes (vinho, ouro), todos com
 * luminosidade diferente para continuarem distintos.
 */
export const CORES_TURMA = [
	"#2f5bb7", // azul
	"#a3486a", // vinho
	"#23798a", // petróleo
	"#c08a2b", // ouro
	"#4f4fae", // índigo
	"#2f7a4f", // verde
	"#7a5cb8", // violeta
	"#5d6b82", // ardósia
];

// Paletas anteriores → nova, pela mesma posição
const PALETAS_ANTIGAS = [
	[
		"#3b82f6",
		"#10b981",
		"#f59e0b",
		"#ef4444",
		"#8b5cf6",
		"#ec4899",
		"#14b8a6",
		"#f97316",
	],
	[
		"#b8552f",
		"#4a6fa5",
		"#4f7a3a",
		"#8e6ba8",
		"#c9862b",
		"#2e8585",
		"#a64d87",
		"#6b6a63",
	],
];
const CORES_PADRAO = CORES_TURMA;

interface TurmasState {
	turmas: Turma[];

	// Actions
	criarTurma: (dados: {
		nome: string;
		descricao?: string;
		cor?: string;
	}) => string;
	atualizarTurma: (
		id: string,
		dados: Partial<Pick<Turma, "nome" | "descricao" | "cor">>,
	) => void;
	excluirTurma: (id: string) => void;
	limpar: () => void;

	// Getters
	getById: (id: string) => Turma | undefined;
	proximaCor: () => string;
}

export const useTurmasStore = create<TurmasState>()(
	persist(
		(set, get) => ({
			turmas: [],

			criarTurma: ({ nome, descricao, cor }) => {
				const id = gerarId();
				const novaTurma: Turma = {
					id,
					nome: nome.trim(),
					descricao: descricao?.trim() || null,
					cor: cor ?? get().proximaCor(),
					criadaEm: new Date().toISOString(),
				};
				set((state) => ({ turmas: [...state.turmas, novaTurma] }));
				return id;
			},

			atualizarTurma: (id, dados) => {
				set((state) => ({
					turmas: state.turmas.map((t) =>
						t.id === id ? { ...t, ...dados } : t,
					),
				}));
			},

			excluirTurma: (id) => {
				set((state) => ({
					turmas: state.turmas.filter((t) => t.id !== id),
				}));
			},

			limpar: () => {
				set({ turmas: [] });
			},

			getById: (id) => get().turmas.find((t) => t.id === id),

			proximaCor: () => {
				const usadas = get().turmas.map((t) => t.cor);
				const disponivel = CORES_PADRAO.find((c) => !usadas.includes(c));
				return (
					disponivel ?? CORES_PADRAO[get().turmas.length % CORES_PADRAO.length]
				);
			},
		}),
		{
			name: "catecumenato-turmas",
			version: 2,
			storage: createJSONStorage(() => localStorage),
			migrate: (persistido, versao) => {
				const estado = persistido as { turmas?: Turma[] } | undefined;
				if (versao < 2 && Array.isArray(estado?.turmas)) {
					return {
						turmas: estado.turmas.map((t) => {
							for (const paleta of PALETAS_ANTIGAS) {
								const i = paleta.indexOf(t.cor.toLowerCase());
								if (i >= 0) return { ...t, cor: CORES_TURMA[i] ?? t.cor };
							}
							return t;
						}),
					};
				}
				return estado as { turmas: Turma[] };
			},
		},
	),
);
