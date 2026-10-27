import { Save } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { CAMPOS_OBRIGATORIOS } from "../../constants/camposObrigatorios";
import { EstadoCivil, Sexo } from "../../types/enums";
import type { Inscricao } from "../../types/inscricao";
import { mascaraData, mascaraTelefone } from "../../utils/mascaras";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { confirmar } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

export type DadosFicha = Pick<
	Inscricao,
	"crismando" | "pai" | "mae" | "padrinho" | "controle"
>;

type Secao = keyof DadosFicha;
type Valor = string | boolean | null;

export function fichaVazia(): DadosFicha {
	const pessoa = {
		nome: null,
		estadoCivil: null,
		naturalidade: null,
		endereco: null,
		bairro: null,
		municipio: null,
		celular: null,
	};
	return {
		crismando: {
			...pessoa,
			sexo: null,
			dataNascimento: null,
			batizado: null,
			paroquiaBatismo: null,
			fezPrimeiraEucaristia: null,
			paroquiaEucaristia: null,
			diaEncontro: null,
			horario: null,
		},
		pai: { ...pessoa },
		mae: { ...pessoa },
		padrinho: {
			nome: null,
			estadoCivil: null,
			celular: null,
			endereco: null,
			bairro: null,
			municipio: null,
		},
		controle: {
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
	};
}

/** Copia só as seções editáveis de uma inscrição */
export function extrairFicha(inscricao: Inscricao): DadosFicha {
	const { crismando, pai, mae, padrinho, controle } = inscricao;
	return {
		crismando: { ...crismando },
		pai: { ...pai },
		mae: { ...mae },
		padrinho: { ...padrinho },
		controle: { ...controle },
	};
}

// Remove espaços nas pontas e troca texto vazio por null
function normalizar(dados: DadosFicha): DadosFicha {
	const limpar = <T extends object>(obj: T): T =>
		Object.fromEntries(
			Object.entries(obj).map(([k, v]) => [
				k,
				typeof v === "string" ? v.trim() || null : v,
			]),
		) as T;
	return {
		crismando: limpar(dados.crismando),
		pai: limpar(dados.pai),
		mae: limpar(dados.mae),
		padrinho: limpar(dados.padrinho),
		controle: limpar(dados.controle),
	};
}

const OPCOES_ESTADO_CIVIL = Object.values(EstadoCivil).map((v) => ({
	value: v,
	label: v,
}));
const OPCOES_SEXO = [
	{ value: Sexo.FEMININO, label: "Feminino" },
	{ value: Sexo.MASCULINO, label: "Masculino" },
	{ value: Sexo.OUTRO, label: "Outro" },
];
const OPCOES_SIM_NAO = [
	{ value: "true", label: "Sim" },
	{ value: "false", label: "Não" },
];

const OBRIGATORIOS = new Set(
	CAMPOS_OBRIGATORIOS.filter((c) => !c.condicao).map((c) => c.path),
);

const GRADE = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

interface InscricaoFormProps {
	inicial: DadosFicha;
	onSalvar: (dados: DadosFicha) => void;
	onCancelar: () => void;
	rotuloSalvar?: string;
}

export function InscricaoForm({
	inicial,
	onSalvar,
	onCancelar,
	rotuloSalvar = "Salvar",
}: InscricaoFormProps) {
	const [base] = useState(inicial);
	const [dados, setDados] = useState<DadosFicha>(inicial);
	const [erroNome, setErroNome] = useState<string>();
	const nomeRef = useRef<HTMLInputElement>(null);
	const alterado = JSON.stringify(dados) !== JSON.stringify(base);

	function definir(secao: Secao, campo: string, valor: Valor) {
		setDados((prev) => ({
			...prev,
			[secao]: { ...prev[secao], [campo]: valor === "" ? null : valor },
		}));
	}

	function ler(secao: Secao, campo: string): Valor {
		return (dados[secao] as unknown as Record<string, Valor>)[campo] ?? null;
	}

	function texto(
		secao: Secao,
		campo: string,
		label: string,
		opcoes: { mascara?: "data" | "telefone"; placeholder?: string } = {},
	) {
		const { mascara, placeholder } = opcoes;
		const aplicar =
			mascara === "data"
				? mascaraData
				: mascara === "telefone"
					? mascaraTelefone
					: (v: string) => v;
		return (
			<Input
				key={`${secao}.${campo}`}
				label={label}
				required={OBRIGATORIOS.has(`${secao}.${campo}`)}
				value={String(ler(secao, campo) ?? "")}
				onChange={(e) => definir(secao, campo, aplicar(e.target.value))}
				placeholder={
					placeholder ??
					(mascara === "data"
						? "DD/MM/AAAA"
						: mascara === "telefone"
							? "(00) 00000-0000"
							: undefined)
				}
				maxLength={
					mascara === "data" ? 10 : mascara === "telefone" ? 15 : undefined
				}
				inputMode={mascara ? "numeric" : undefined}
				autoComplete="off"
			/>
		);
	}

	function escolha(
		secao: Secao,
		campo: string,
		label: string,
		opcoes: { value: string; label: string }[],
	) {
		return (
			<Select
				key={`${secao}.${campo}`}
				label={label}
				required={OBRIGATORIOS.has(`${secao}.${campo}`)}
				value={String(ler(secao, campo) ?? "")}
				onChange={(e) => definir(secao, campo, e.target.value)}
				options={opcoes}
				placeholder="Selecione…"
			/>
		);
	}

	function simNao(secao: Secao, campo: string, label: string) {
		const valor = ler(secao, campo);
		return (
			<Select
				key={`${secao}.${campo}`}
				label={label}
				required={OBRIGATORIOS.has(`${secao}.${campo}`)}
				value={valor === null ? "" : String(valor)}
				onChange={(e) =>
					definir(
						secao,
						campo,
						e.target.value === "" ? null : e.target.value === "true",
					)
				}
				options={OPCOES_SIM_NAO}
				placeholder="Selecione…"
			/>
		);
	}

	function pessoa(secao: "pai" | "mae") {
		return (
			<div className={GRADE}>
				{texto(secao, "nome", "Nome")}
				{texto(secao, "celular", "Celular", { mascara: "telefone" })}
				{escolha(secao, "estadoCivil", "Estado civil", OPCOES_ESTADO_CIVIL)}
				{texto(secao, "naturalidade", "Naturalidade")}
				{texto(secao, "endereco", "Endereço")}
				{texto(secao, "bairro", "Bairro")}
				{texto(secao, "municipio", "Município")}
			</div>
		);
	}

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!dados.crismando.nome?.trim()) {
			setErroNome("Informe o nome do crismando para salvar a ficha.");
			nomeRef.current?.focus();
			return;
		}
		onSalvar(normalizar(dados));
	}

	async function handleCancelar() {
		if (
			alterado &&
			!(await confirmar({
				titulo: "Descartar alterações?",
				descricao: "As mudanças feitas nesta ficha ainda não foram salvas.",
				confirmar: "Descartar",
				cancelar: "Continuar editando",
				perigo: true,
			}))
		) {
			return;
		}
		onCancelar();
	}

	return (
		<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
			<p className="text-[13px] text-muted">
				Só o nome é necessário para salvar. Os campos com{" "}
				<span className="text-accent">*</span> são exigidos para concluir a
				ficha.
			</p>

			<Card>
				<CardHeader title="Crismando" />
				<CardContent className={GRADE}>
					<Input
						ref={nomeRef}
						label="Nome completo"
						required
						wrapperClassName="sm:col-span-2"
						value={dados.crismando.nome ?? ""}
						onChange={(e) => {
							definir("crismando", "nome", e.target.value);
							if (erroNome && e.target.value.trim()) setErroNome(undefined);
						}}
						error={erroNome}
						autoComplete="off"
					/>
					{texto("crismando", "dataNascimento", "Data de nascimento", {
						mascara: "data",
					})}
					{texto("crismando", "celular", "Celular", { mascara: "telefone" })}
					{escolha("crismando", "sexo", "Sexo", OPCOES_SEXO)}
					{escolha("crismando", "estadoCivil", "Estado civil", OPCOES_ESTADO_CIVIL)}
					{texto("crismando", "naturalidade", "Naturalidade")}
					{texto("crismando", "endereco", "Endereço")}
					{texto("crismando", "bairro", "Bairro")}
					{texto("crismando", "municipio", "Município")}
					{simNao("crismando", "batizado", "É batizado(a)?")}
					<Input
						label="Paróquia do batismo"
						required={dados.crismando.batizado === true}
						value={dados.crismando.paroquiaBatismo ?? ""}
						onChange={(e) =>
							definir("crismando", "paroquiaBatismo", e.target.value)
						}
						autoComplete="off"
					/>
					{simNao("crismando", "fezPrimeiraEucaristia", "Fez a Primeira Eucaristia?")}
					{texto("crismando", "paroquiaEucaristia", "Paróquia da Eucaristia")}
					{texto("crismando", "diaEncontro", "Dia do encontro", {
						placeholder: "Ex.: Sábado",
					})}
					{texto("crismando", "horario", "Horário", { placeholder: "Ex.: 16h" })}
				</CardContent>
			</Card>

			<Card>
				<CardHeader title="Pai" />
				<CardContent>{pessoa("pai")}</CardContent>
			</Card>

			<Card>
				<CardHeader title="Mãe" />
				<CardContent>{pessoa("mae")}</CardContent>
			</Card>

			<Card>
				<CardHeader title="Padrinho ou madrinha" description="Opcional." />
				<CardContent className={GRADE}>
					{texto("padrinho", "nome", "Nome")}
					{texto("padrinho", "celular", "Celular", { mascara: "telefone" })}
					{escolha("padrinho", "estadoCivil", "Estado civil", OPCOES_ESTADO_CIVIL)}
					{texto("padrinho", "endereco", "Endereço")}
					{texto("padrinho", "bairro", "Bairro")}
					{texto("padrinho", "municipio", "Município")}
				</CardContent>
			</Card>

			<Card>
				<CardHeader
					title="Controle da paróquia"
					description="Preenchido pela secretaria."
				/>
				<CardContent className={GRADE}>
					{texto("controle", "catequistas", "Catequistas")}
					{texto("controle", "celebrante", "Celebrante")}
					{texto("controle", "local", "Local")}
					{texto("controle", "data", "Data da Crisma", { mascara: "data" })}
					{texto("controle", "livro", "Livro")}
					{texto("controle", "folha", "Folha")}
					{texto("controle", "numero", "Número")}
					{texto("controle", "inicioPreparacao", "Início da preparação", {
						mascara: "data",
					})}
					{texto("controle", "fimPreparacao", "Fim da preparação", {
						mascara: "data",
					})}
				</CardContent>
			</Card>

			<div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 rounded-[14px] bg-surface px-4 py-3 shadow-pop">
				<span className="mr-auto text-[13px] text-muted" aria-live="polite">
					{alterado ? "Alterações não salvas" : "Nenhuma alteração"}
				</span>
				<Button variant="secondary" onClick={handleCancelar}>
					Cancelar
				</Button>
				<Button type="submit">
					<Save />
					{rotuloSalvar}
				</Button>
			</div>
		</form>
	);
}
