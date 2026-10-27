import { create } from "zustand";
import { gerarId } from "../utils/id";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Turma } from "../types/turma";

/** Paleta de cores das turmas (tons quentes, distintos também em luminosidade) */
export const CORES_TURMA = [
	"#b8552f", // terracota
	"#4a6fa5", // azul
	"#4f7a3a", // oliva
	"#8e6ba8", // violeta
	"#c9862b", // âmbar
	"#2e8585", // petróleo
	"#a64d87", // magenta
	"#6b6a63", // cinza quente
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
			version: 1,
			storage: createJSONStorage(() => localStorage),
		},
	),
);
