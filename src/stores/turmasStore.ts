import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Turma } from "../types/turma";

const CORES_PADRAO = [
	"#3b82f6", // blue
	"#10b981", // emerald
	"#f59e0b", // amber
	"#ef4444", // red
	"#8b5cf6", // violet
	"#ec4899", // pink
	"#14b8a6", // teal
	"#f97316", // orange
];

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

	// Getters
	getById: (id: string) => Turma | undefined;
	proximaCor: () => string;
}

export const useTurmasStore = create<TurmasState>()(
	persist(
		(set, get) => ({
			turmas: [],

			criarTurma: ({ nome, descricao, cor }) => {
				const id = crypto.randomUUID();
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
