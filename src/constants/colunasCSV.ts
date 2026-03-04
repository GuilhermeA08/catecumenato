// Mapeamento entre os headers do CSV e os caminhos na interface Inscricao
// O CSV gerado/importado usará estes nomes de coluna

export const COLUNAS_CSV: Record<string, string> = {
	// Crismando
	"CRISMANDO(A)": "crismando.nome",
	ESTADO_CIVIL_CRISMANDO: "crismando.estadoCivil",
	SEXO: "crismando.sexo",
	DATA_NASCIMENTO: "crismando.dataNascimento",
	NATURALIDADE_CRISMANDO: "crismando.naturalidade",
	ENDERECO: "crismando.endereco",
	BAIRRO: "crismando.bairro",
	MUNICIPIO: "crismando.municipio",
	CELULAR: "crismando.celular",
	BATIZADO: "crismando.batizado",
	PAROQUIA_BATISMO: "crismando.paroquiaBatismo",
	FEZ_PRIMEIRA_EUCARISTIA: "crismando.fezPrimeiraEucaristia",
	PAROQUIA_EUCARISTIA: "crismando.paroquiaEucaristia",
	DIA_ENCONTRO: "crismando.diaEncontro",
	HORARIO: "crismando.horario",

	// Pai
	NOME_PAI: "pai.nome",
	ESTADO_CIVIL_PAI: "pai.estadoCivil",
	NATURALIDADE_PAI: "pai.naturalidade",
	ENDERECO_PAI: "pai.endereco",
	BAIRRO_PAI: "pai.bairro",
	MUNICIPIO_PAI: "pai.municipio",
	CELULAR_PAI: "pai.celular",

	// Mãe
	NOME_MAE: "mae.nome",
	ESTADO_CIVIL_MAE: "mae.estadoCivil",
	NATURALIDADE_MAE: "mae.naturalidade",
	ENDERECO_MAE: "mae.endereco",
	BAIRRO_MAE: "mae.bairro",
	MUNICIPIO_MAE: "mae.municipio",
	CELULAR_MAE: "mae.celular",

	// Padrinho/Madrinha
	NOME_PADRINHO: "padrinho.nome",
	ESTADO_CIVIL_PADRINHO: "padrinho.estadoCivil",
	CELULAR_PADRINHO: "padrinho.celular",
	ENDERECO_PADRINHO: "padrinho.endereco",
	BAIRRO_PADRINHO: "padrinho.bairro",
	MUNICIPIO_PADRINHO: "padrinho.municipio",

	// Controle
	CATEQUISTAS: "controle.catequistas",
	CELEBRANTE: "controle.celebrante",
	LOCAL: "controle.local",
	DATA_CRISMA: "controle.data",
	LIVRO: "controle.livro",
	FOLHA: "controle.folha",
	NUMERO: "controle.numero",
	INICIO_PREPARACAO: "controle.inicioPreparacao",
	FIM_PREPARACAO: "controle.fimPreparacao",
};

// Inverso: path → coluna CSV
export const COLUNAS_CSV_INVERSO: Record<string, string> = Object.fromEntries(
	Object.entries(COLUNAS_CSV).map(([k, v]) => [v, k]),
);

// Lista ordenada de todas as colunas para exportação
export const ORDEM_COLUNAS_CSV = Object.keys(COLUNAS_CSV);
