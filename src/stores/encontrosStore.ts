import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Encontro, EncontroFormData } from "../types/encontro";
import { StatusPresenca } from "../types/enums";
import { useInscricoesStore } from "./inscricoesStore";
import { usePresencasStore } from "./presencasStore";

interface EncontrosState {
	encontros: Encontro[];

	// Actions
	criarEncontro: (dados: EncontroFormData) => string;
	atualizarEncontro: (id: string, dados: Partial<EncontroFormData>) => void;
	excluirEncontro: (id: string) => void;
	limpar: () => void;

	// Getters
	getById: (id: string) => Encontro | undefined;
	getByTurma: (turmaId: string) => Encontro[];
}

export const useEncontrosStore = create<EncontrosState>()(
	persist(
		(set, get) => ({
			encontros: [],

			criarEncontro: (dados) => {
				const agora = new Date().toISOString();
				const id = crypto.randomUUID();
				const encontro: Encontro = {
					id,
					turmaId: dados.turmaId,
					dataEncontro: dados.dataEncontro,
					horarioInicio: dados.horarioInicio,
					horarioFim: dados.horarioFim ?? null,
					local: dados.local ?? null,
					observacoes: dados.observacoes ?? null,
					criadoEm: agora,
					atualizadoEm: agora,
				};

				set((state) => ({ encontros: [...state.encontros, encontro] }));

				const membrosDaTurma = useInscricoesStore
					.getState()
					.inscricoes.filter((i) => i.turmaId === dados.turmaId);

				if (membrosDaTurma.length > 0) {
					usePresencasStore.getState().registrarLote(
						id,
						membrosDaTurma.map((membro) => ({
							inscritoId: membro.id,
							status: StatusPresenca.PENDENTE,
						})),
					);
				}

				return id;
			},

			atualizarEncontro: (id, dados) => {
				set((state) => ({
					encontros: state.encontros.map((e) =>
						e.id === id
							? {
									...e,
									...dados,
									atualizadoEm: new Date().toISOString(),
								}
							: e,
					),
				}));
			},

			excluirEncontro: (id) => {
				set((state) => ({
					encontros: state.encontros.filter((e) => e.id !== id),
				}));
				usePresencasStore.getState().removerPorEncontro(id);
			},

			limpar: () => {
				set({ encontros: [] });
			},

			getById: (id) => get().encontros.find((e) => e.id === id),
			getByTurma: (turmaId) =>
				get().encontros.filter((e) => e.turmaId === turmaId),
		}),
		{
			name: "catecumenato-encontros",
			version: 1,
			storage: createJSONStorage(() => localStorage),
		},
	),
);
