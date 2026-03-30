import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StatusPresenca } from "../types/enums";
import type { Presenca } from "../types/presenca";

interface PresencasState {
	presencas: Presenca[];

	// Actions
	definirStatus: (
		encontroId: string,
		inscritoId: string,
		status: StatusPresenca,
		observacoes?: string | null,
	) => string;
	registrarLote: (
		encontroId: string,
		itens: Array<{
			inscritoId: string;
			status: StatusPresenca;
			observacoes?: string | null;
		}>,
	) => void;
	removerPorEncontro: (encontroId: string) => void;
	limpar: () => void;

	// Getters
	getByEncontro: (encontroId: string) => Presenca[];
	getByInscrito: (inscritoId: string) => Presenca[];
}

export const usePresencasStore = create<PresencasState>()(
	persist(
		(set, get) => ({
			presencas: [],

			definirStatus: (encontroId, inscritoId, status, observacoes = null) => {
				const agora = new Date().toISOString();
				const existente = get().presencas.find(
					(p) => p.encontroId === encontroId && p.inscritoId === inscritoId,
				);

				if (existente) {
					set((state) => ({
						presencas: state.presencas.map((p) =>
							p.id === existente.id
								? {
										...p,
										status,
										observacoes,
										atualizadoEm: agora,
									}
								: p,
						),
					}));
					return existente.id;
				}

				const id = crypto.randomUUID();
				const nova: Presenca = {
					id,
					encontroId,
					inscritoId,
					status,
					observacoes,
					registradoEm: agora,
					atualizadoEm: agora,
				};

				set((state) => ({ presencas: [...state.presencas, nova] }));
				return id;
			},

			registrarLote: (encontroId, itens) => {
				for (const item of itens) {
					get().definirStatus(
						encontroId,
						item.inscritoId,
						item.status,
						item.observacoes ?? null,
					);
				}
			},

			removerPorEncontro: (encontroId) => {
				set((state) => ({
					presencas: state.presencas.filter((p) => p.encontroId !== encontroId),
				}));
			},

			limpar: () => {
				set({ presencas: [] });
			},

			getByEncontro: (encontroId) =>
				get().presencas.filter((p) => p.encontroId === encontroId),
			getByInscrito: (inscritoId) =>
				get().presencas.filter((p) => p.inscritoId === inscritoId),
		}),
		{
			name: "catecumenato-presencas",
			version: 1,
			storage: createJSONStorage(() => localStorage),
		},
	),
);
