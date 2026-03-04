import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
	exportarCSV,
	recalcularInscricao,
} from "../features/inscricoes/services/csvService";
import { Status } from "../types/enums";
import type { Inscricao } from "../types/inscricao";

interface InscricoesState {
	inscricoes: Inscricao[];
	carregado: boolean;
	importadoEm: string | null;

	// Actions
	setInscricoes: (inscricoes: Inscricao[]) => void;
	adicionarInscricao: (
		dados: Partial<
			Omit<
				Inscricao,
				"id" | "status" | "completude" | "camposFaltantes" | "atualizadoEm"
			>
		>,
	) => string;
	atualizarInscricao: (
		id: string,
		dados: Partial<Omit<Inscricao, "id">>,
	) => void;
	alterarStatus: (id: string, status: Status, override?: boolean) => void;
	vincularTurma: (id: string, turmaId: string | null) => void;
	excluirInscricao: (id: string) => void;
	exportar: () => void;
	limpar: () => void;

	// Getters
	getById: (id: string) => Inscricao | undefined;
	getTotais: () => { total: number; pendentes: number; concluidos: number };
}

export const useInscricoesStore = create<InscricoesState>()(
	persist(
		(set, get) => ({
			inscricoes: [],
			carregado: false,
			importadoEm: null,

			setInscricoes: (inscricoes) => {
				set({
					inscricoes,
					carregado: true,
					importadoEm: new Date().toISOString(),
				});
			},

			adicionarInscricao: (dados) => {
				const nova = recalcularInscricao({
					id: crypto.randomUUID(),
					turmaId: dados.turmaId ?? null,
					crismando: dados.crismando ?? {
						nome: null,
						estadoCivil: null,
						sexo: null,
						dataNascimento: null,
						naturalidade: null,
						endereco: null,
						bairro: null,
						municipio: null,
						celular: null,
						batizado: null,
						paroquiaBatismo: null,
						fezPrimeiraEucaristia: null,
						paroquiaEucaristia: null,
						diaEncontro: null,
						horario: null,
					},
					pai: dados.pai ?? {
						nome: null,
						estadoCivil: null,
						naturalidade: null,
						endereco: null,
						bairro: null,
						municipio: null,
						celular: null,
					},
					mae: dados.mae ?? {
						nome: null,
						estadoCivil: null,
						naturalidade: null,
						endereco: null,
						bairro: null,
						municipio: null,
						celular: null,
					},
					padrinho: dados.padrinho ?? {
						nome: null,
						estadoCivil: null,
						celular: null,
						endereco: null,
						bairro: null,
						municipio: null,
					},
					controle: dados.controle ?? {
						catequistas: null,
						celebrante: null,
						local: null,
						data: null,
						livro: null,
						folha: null,
						numero: null,
						inicioPreparacao: null,
						fimPreparacao: null,
					},
					status: Status.PENDENTE,
					statusOverride: false,
					completude: 0,
					camposFaltantes: [],
					atualizadoEm: new Date().toISOString(),
				});
				set((state) => ({
					inscricoes: [...state.inscricoes, nova],
					carregado: true,
					importadoEm: state.importadoEm ?? new Date().toISOString(),
				}));
				return nova.id;
			},

			atualizarInscricao: (id, dados) => {
				set((state) => ({
					inscricoes: state.inscricoes.map((inscricao) => {
						if (inscricao.id !== id) return inscricao;
						const atualizada = { ...inscricao, ...dados } as Inscricao;
						return recalcularInscricao(atualizada);
					}),
				}));
			},

			alterarStatus: (id, status, override = true) => {
				set((state) => ({
					inscricoes: state.inscricoes.map((inscricao) => {
						if (inscricao.id !== id) return inscricao;
						return {
							...inscricao,
							status,
							statusOverride: override,
							atualizadoEm: new Date().toISOString(),
						};
					}),
				}));
			},

			vincularTurma: (id, turmaId) => {
				set((state) => ({
					inscricoes: state.inscricoes.map((i) =>
						i.id === id ? { ...i, turmaId } : i,
					),
				}));
			},

			excluirInscricao: (id) => {
				set((state) => ({
					inscricoes: state.inscricoes.filter((i) => i.id !== id),
				}));
			},

			exportar: () => {
				exportarCSV(get().inscricoes);
			},

			limpar: () => {
				set({ inscricoes: [], carregado: false, importadoEm: null });
			},

			getById: (id) => {
				return get().inscricoes.find((i) => i.id === id);
			},

			getTotais: () => {
				const inscricoes = get().inscricoes;
				const pendentes = inscricoes.filter(
					(i) => i.status === Status.PENDENTE,
				).length;
				const concluidos = inscricoes.filter(
					(i) => i.status === Status.CONCLUIDO,
				).length;
				return { total: inscricoes.length, pendentes, concluidos };
			},
		}),
		{
			name: "catecumenato-inscricoes",
			version: 1,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				inscricoes: state.inscricoes,
				carregado: state.carregado,
				importadoEm: state.importadoEm,
			}),
		},
	),
);
