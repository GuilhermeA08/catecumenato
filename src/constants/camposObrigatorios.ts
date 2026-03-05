import type { Inscricao } from "../types/inscricao";

export interface CampoConfig {
	path: string;
	label: string;
	secao: string;
	/** Se false, o campo conta p/ completude mas NÃO afeta o status PENDENTE/CONCLUIDO */
	afetaStatus?: boolean;
	condicao?: (inscricao: Inscricao) => boolean;
}

export const CAMPOS_OBRIGATORIOS: CampoConfig[] = [
	// Crismando
	{ path: "crismando.nome", label: "Nome do Crismando", secao: "Crismando" },
	{
		path: "crismando.dataNascimento",
		label: "Data de Nascimento",
		secao: "Crismando",
	},
	{
		path: "crismando.celular",
		label: "Celular do Crismando",
		secao: "Crismando",
	},
	{ path: "crismando.endereco", label: "Endereço", secao: "Crismando" },
	{ path: "crismando.bairro", label: "Bairro", secao: "Crismando" },
	{ path: "crismando.municipio", label: "Município", secao: "Crismando" },
	{ path: "crismando.sexo", label: "Sexo", secao: "Crismando" },
	{
		path: "crismando.estadoCivil",
		label: "Estado Civil do Crismando",
		secao: "Crismando",
	},
	{ path: "crismando.batizado", label: "É batizado?", secao: "Crismando" },
	{
		path: "crismando.paroquiaBatismo",
		label: "Paróquia do Batismo",
		secao: "Crismando",
		condicao: (i) => i.crismando.batizado === true,
	},
	{
		path: "crismando.fezPrimeiraEucaristia",
		label: "Fez Primeira Eucaristia?",
		secao: "Crismando",
	},
	{
		path: "crismando.diaEncontro",
		label: "Dia do Encontro",
		secao: "Crismando",
	},
	{
		path: "crismando.horario",
		label: "Horário do Encontro",
		secao: "Crismando",
	},

	// Pai
	{ path: "pai.nome", label: "Nome do Pai", secao: "Pai" },
	{ path: "pai.celular", label: "Celular do Pai", secao: "Pai", afetaStatus: false },
	{ path: "pai.estadoCivil", label: "Estado Civil do Pai", secao: "Pai", afetaStatus: false },
	{ path: "pai.naturalidade", label: "Naturalidade do Pai", secao: "Pai", afetaStatus: false },
	{ path: "pai.endereco", label: "Endereço do Pai", secao: "Pai", afetaStatus: false },
	{ path: "pai.bairro", label: "Bairro do Pai", secao: "Pai", afetaStatus: false },
	{ path: "pai.municipio", label: "Município do Pai", secao: "Pai", afetaStatus: false },

	// Mãe
	{ path: "mae.nome", label: "Nome da Mãe", secao: "Mãe" },
	{ path: "mae.celular", label: "Celular da Mãe", secao: "Mãe", afetaStatus: false },
	{ path: "mae.estadoCivil", label: "Estado Civil da Mãe", secao: "Mãe", afetaStatus: false },
	{ path: "mae.naturalidade", label: "Naturalidade da Mãe", secao: "Mãe", afetaStatus: false },
	{ path: "mae.endereco", label: "Endereço da Mãe", secao: "Mãe", afetaStatus: false },
	{ path: "mae.bairro", label: "Bairro da Mãe", secao: "Mãe", afetaStatus: false },
	{ path: "mae.municipio", label: "Município da Mãe", secao: "Mãe", afetaStatus: false },
];

export const CAMPOS_OPCIONAIS: CampoConfig[] = [
	{
		path: "crismando.naturalidade",
		label: "Naturalidade do Crismando",
		secao: "Crismando",
	},
	{
		path: "crismando.paroquiaEucaristia",
		label: "Paróquia da Eucaristia",
		secao: "Crismando",
	},
	{
		path: "padrinho.nome",
		label: "Nome do Padrinho/Madrinha",
		secao: "Padrinho/Madrinha",
	},
	{
		path: "padrinho.estadoCivil",
		label: "Estado Civil do Padrinho/Madrinha",
		secao: "Padrinho/Madrinha",
	},
	{
		path: "padrinho.celular",
		label: "Celular do Padrinho/Madrinha",
		secao: "Padrinho/Madrinha",
	},
	{
		path: "padrinho.endereco",
		label: "Endereço do Padrinho/Madrinha",
		secao: "Padrinho/Madrinha",
	},
	{
		path: "padrinho.bairro",
		label: "Bairro do Padrinho/Madrinha",
		secao: "Padrinho/Madrinha",
	},
	{
		path: "padrinho.municipio",
		label: "Município do Padrinho/Madrinha",
		secao: "Padrinho/Madrinha",
	},
];
