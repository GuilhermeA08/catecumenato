import type { StatusPresenca } from "./enums";

export interface Presenca {
	id: string;
	encontroId: string;
	inscritoId: string;
	status: StatusPresenca;
	observacoes: string | null;
	registradoEm: string;
	atualizadoEm: string;
}

export type PresencaFormData = Omit<
	Presenca,
	"id" | "registradoEm" | "atualizadoEm"
>;
