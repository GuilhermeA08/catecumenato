import { CAMPOS_OBRIGATORIOS } from "../../constants/camposObrigatorios";
import { Sexo } from "../../types/enums";
import type { DadosPessoa, Inscricao } from "../../types/inscricao";
import { obterValor, temValor } from "../../utils/completude";
import { calcularIdade } from "../../utils/mascaras";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { CampoComCopia } from "./CampoComCopia";
import { SecaoDados } from "./SecaoDados";

const ROTULO_SEXO: Record<string, string> = {
	[Sexo.FEMININO]: "Feminino",
	[Sexo.MASCULINO]: "Masculino",
};

function faltantesNaSecao(inscricao: Inscricao, secoes: string[]): number {
	return CAMPOS_OBRIGATORIOS.filter(
		(campo) =>
			secoes.includes(campo.secao) &&
			(!campo.condicao || campo.condicao(inscricao)) &&
			!temValor(obterValor(inscricao, campo.path)),
	).length;
}

function Pessoa({ titulo, pessoa }: { titulo: string; pessoa: DadosPessoa }) {
	return (
		<div className="min-w-0">
			<h3 className="mb-3 text-[13px] font-medium text-ink-2">{titulo}</h3>
			<dl className="flex flex-col gap-3">
				<CampoComCopia label="Nome" valor={pessoa.nome} obrigatorio />
				<CampoComCopia label="Celular" valor={pessoa.celular} obrigatorio />
				<CampoComCopia label="Estado civil" valor={pessoa.estadoCivil} obrigatorio />
				<CampoComCopia label="Naturalidade" valor={pessoa.naturalidade} obrigatorio />
				<CampoComCopia label="Endereço" valor={pessoa.endereco} obrigatorio />
				<CampoComCopia label="Bairro" valor={pessoa.bairro} obrigatorio />
				<CampoComCopia label="Município" valor={pessoa.municipio} obrigatorio />
			</dl>
		</div>
	);
}

/** Seções de leitura da ficha (com cópia por campo) */
export function FichaDados({ inscricao }: { inscricao: Inscricao }) {
	const { crismando, pai, mae, padrinho, controle } = inscricao;
	const idade = calcularIdade(crismando.dataNascimento);
	const faltPais = faltantesNaSecao(inscricao, ["Pai", "Mãe"]);

	return (
		<div className="flex flex-col gap-4">
			<SecaoDados
				titulo="Crismando"
				alertas={faltantesNaSecao(inscricao, ["Crismando"])}
			>
				<CampoComCopia label="Nome" valor={crismando.nome} obrigatorio />
				<CampoComCopia
					label={idade === null ? "Data de nascimento" : `Data de nascimento · ${idade} anos`}
					valor={crismando.dataNascimento}
					obrigatorio
				/>
				<CampoComCopia label="Celular" valor={crismando.celular} obrigatorio />
				<CampoComCopia
					label="Sexo"
					valor={crismando.sexo ? (ROTULO_SEXO[crismando.sexo] ?? crismando.sexo) : null}
					obrigatorio
				/>
				<CampoComCopia label="Estado civil" valor={crismando.estadoCivil} obrigatorio />
				<CampoComCopia label="Naturalidade" valor={crismando.naturalidade} />
				<CampoComCopia label="Endereço" valor={crismando.endereco} obrigatorio />
				<CampoComCopia label="Bairro" valor={crismando.bairro} obrigatorio />
				<CampoComCopia label="Município" valor={crismando.municipio} obrigatorio />
				<CampoComCopia
					label="Batizado(a)"
					valor={crismando.batizado}
					obrigatorio
					tipo="boolean"
				/>
				<CampoComCopia
					label="Paróquia do batismo"
					valor={crismando.paroquiaBatismo}
					obrigatorio={crismando.batizado === true}
				/>
				<CampoComCopia
					label="Primeira Eucaristia"
					valor={crismando.fezPrimeiraEucaristia}
					obrigatorio
					tipo="boolean"
				/>
				<CampoComCopia
					label="Paróquia da Eucaristia"
					valor={crismando.paroquiaEucaristia}
				/>
				<CampoComCopia label="Dia do encontro" valor={crismando.diaEncontro} obrigatorio />
				<CampoComCopia label="Horário" valor={crismando.horario} obrigatorio />
			</SecaoDados>

			<Card>
				<CardHeader
					title="Pais"
					actions={
						faltPais > 0 && (
							<span className="text-xs text-warn-ink">
								{faltPais} campo{faltPais > 1 ? "s" : ""} faltando
							</span>
						)
					}
				/>
				<CardContent className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
					<Pessoa titulo="Pai" pessoa={pai} />
					<Pessoa titulo="Mãe" pessoa={mae} />
				</CardContent>
			</Card>

			<SecaoDados titulo="Padrinho ou madrinha">
				<CampoComCopia label="Nome" valor={padrinho.nome} />
				<CampoComCopia label="Celular" valor={padrinho.celular} />
				<CampoComCopia label="Estado civil" valor={padrinho.estadoCivil} />
				<CampoComCopia label="Endereço" valor={padrinho.endereco} />
				<CampoComCopia label="Bairro" valor={padrinho.bairro} />
				<CampoComCopia label="Município" valor={padrinho.municipio} />
			</SecaoDados>

			<SecaoDados titulo="Controle da paróquia" colunas="estreita">
				<CampoComCopia label="Catequistas" valor={controle.catequistas} />
				<CampoComCopia label="Celebrante" valor={controle.celebrante} />
				<CampoComCopia label="Local" valor={controle.local} />
				<CampoComCopia label="Data da Crisma" valor={controle.data} />
				<CampoComCopia label="Livro" valor={controle.livro} />
				<CampoComCopia label="Folha" valor={controle.folha} />
				<CampoComCopia label="Número" valor={controle.numero} />
				<CampoComCopia label="Início da preparação" valor={controle.inicioPreparacao} />
				<CampoComCopia label="Fim da preparação" valor={controle.fimPreparacao} />
			</SecaoDados>
		</div>
	);
}
