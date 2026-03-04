import type { EstadoCivil, Sexo, Status } from "./enums";

export interface DadosPessoa {
	nome: string | null;
	estadoCivil: EstadoCivil | string | null;
	naturalidade: string | null;
	endereco: string | null;
	bairro: string | null;
	municipio: string | null;
	celular: string | null;
}

export interface DadosPadrinhoMadrinha {
	nome: string | null;
	estadoCivil: EstadoCivil | string | null;
	celular: string | null;
	endereco: string | null;
	bairro: string | null;
	municipio: string | null;
}

export interface ControleAdministrativo {
	catequistas: string | null;
	celebrante: string | null;
	local: string | null;
	data: string | null;
	livro: string | null;
	folha: string | null;
	numero: string | null;
	inicioPreparacao: string | null;
	fimPreparacao: string | null;
}

export interface DadosCrismando {
	nome: string | null;
	estadoCivil: EstadoCivil | string | null;
	sexo: Sexo | string | null;
	dataNascimento: string | null;
	naturalidade: string | null;
	endereco: string | null;
	bairro: string | null;
	municipio: string | null;
	celular: string | null;
	batizado: boolean | null;
	paroquiaBatismo: string | null;
	fezPrimeiraEucaristia: boolean | null;
	paroquiaEucaristia: string | null;
	diaEncontro: string | null;
	horario: string | null;
}

export interface Inscricao {
	id: string;
	crismando: DadosCrismando;
	pai: DadosPessoa;
	mae: DadosPessoa;
	padrinho: DadosPadrinhoMadrinha;
	controle: ControleAdministrativo;
	// Metadados calculados
	status: Status;
	statusOverride: boolean;
	completude: number; // 0-100
	camposFaltantes: string[];
	atualizadoEm: string;
}

export type InscricaoFormData = Omit<
	Inscricao,
	"id" | "status" | "completude" | "camposFaltantes" | "atualizadoEm"
>;
