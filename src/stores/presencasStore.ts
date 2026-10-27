import { create } from "zustand";
import { gerarId } from "../utils/id";
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
	/** Remove presenças do inscrito (todas, ou só dos encontros informados) */
	removerPorInscrito: (inscritoId: string, encontroIds?: string[]) => void;
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

				const id = gerarId();
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
				// Um único set → uma única gravação no localStorage
				const agora = new Date().toISOString();
				set((state) => {
					const porInscrito = new Map(itens.map((i) => [i.inscritoId, i]));
					const atualizadas = state.presencas.map((p) => {
						if (p.encontroId !== encontroId) return p;
						const item = porInscrito.get(p.inscritoId);
						if (!item) return p;
						porInscrito.delete(p.inscritoId);
						return {
							...p,
							status: item.status,
							observacoes: item.observacoes ?? null,
							atualizadoEm: agora,
						};
					});
					const novas: Presenca[] = [...porInscrito.values()].map((item) => ({
						id: gerarId(),
						encontroId,
						inscritoId: item.inscritoId,
						status: item.status,
						observacoes: item.observacoes ?? null,
						registradoEm: agora,
						atualizadoEm: agora,
					}));
					return { presencas: [...atualizadas, ...novas] };
				});
			},

			removerPorEncontro: (encontroId) => {
				set((state) => ({
					presencas: state.presencas.filter((p) => p.encontroId !== encontroId),
				}));
			},

			removerPorInscrito: (inscritoId, encontroIds) => {
				set((state) => ({
					presencas: state.presencas.filter(
						(p) =>
							p.inscritoId !== inscritoId ||
							(encontroIds !== undefined && !encontroIds.includes(p.encontroId)),
					),
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
