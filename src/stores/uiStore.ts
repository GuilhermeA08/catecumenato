import { create } from "zustand";
import type { Status } from "../types/enums";

type FiltroStatus = Status | "todos";

interface UiState {
	busca: string;
	filtroStatus: FiltroStatus;
	setBusca: (busca: string) => void;
	setFiltroStatus: (filtro: FiltroStatus) => void;
	resetFiltros: () => void;
}

export const useUiStore = create<UiState>((set) => ({
	busca: "",
	filtroStatus: "todos",

	setBusca: (busca) => set({ busca }),
	setFiltroStatus: (filtroStatus) => set({ filtroStatus }),
	resetFiltros: () => set({ busca: "", filtroStatus: "todos" }),
}));
