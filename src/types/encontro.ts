export interface Encontro {
	id: string;
	turmaId: string;
	dataEncontro: string; // YYYY-MM-DD
	horarioInicio: string; // HH:mm
	horarioFim: string | null;
	local: string | null;
	observacoes: string | null;
	criadoEm: string;
	atualizadoEm: string;
}

export type EncontroFormData = Omit<
	Encontro,
	"id" | "criadoEm" | "atualizadoEm"
>;
