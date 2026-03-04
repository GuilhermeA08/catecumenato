import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
import { SecaoDados } from "../../components/inscrito/SecaoDados";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { EstadoCivil, Sexo } from "../../types/enums";
import type {
	ControleAdministrativo,
	DadosCrismando,
	DadosPadrinhoMadrinha,
	DadosPessoa,
} from "../../types/inscricao";
import { mascaraData, mascaraTelefone } from "../../utils/mascaras";

export const Route = createFileRoute("/inscritos/novo")({
	component: NovoInscritoPage,
});

const OPCOES_ESTADO_CIVIL = Object.values(EstadoCivil).map((v) => ({
	value: v,
	label: v,
}));
const OPCOES_SEXO = Object.values(Sexo).map((v) => ({ value: v, label: v }));
const OPCOES_SIM_NAO = [
	{ value: "true", label: "Sim" },
	{ value: "false", label: "Não" },
];

const CRISMANDO_VAZIO: DadosCrismando = {
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
};

const PESSOA_VAZIA: DadosPessoa = {
	nome: null,
	estadoCivil: null,
	naturalidade: null,
	endereco: null,
	bairro: null,
	municipio: null,
	celular: null,
};

const PADRINHO_VAZIO: DadosPadrinhoMadrinha = {
	nome: null,
	estadoCivil: null,
	celular: null,
	endereco: null,
	bairro: null,
	municipio: null,
};

const CONTROLE_VAZIO: ControleAdministrativo = {
	catequistas: null,
	celebrante: null,
	local: null,
	data: null,
	livro: null,
	folha: null,
	numero: null,
	inicioPreparacao: null,
	fimPreparacao: null,
};

function NovoInscritoPage() {
	const navigate = useNavigate();
	const { adicionarInscricao } = useInscricoesStore();

	const [crismando, setCrismando] = useState<DadosCrismando>({
		...CRISMANDO_VAZIO,
	});
	const [pai, setPai] = useState<DadosPessoa>({ ...PESSOA_VAZIA });
	const [mae, setMae] = useState<DadosPessoa>({ ...PESSOA_VAZIA });
	const [padrinho, setPadrinho] = useState<DadosPadrinhoMadrinha>({
		...PADRINHO_VAZIO,
	});
	const [controle, setControle] = useState<ControleAdministrativo>({
		...CONTROLE_VAZIO,
	});

	function updateCrismando<K extends keyof DadosCrismando>(
		key: K,
		value: DadosCrismando[K],
	) {
		setCrismando((prev) => ({ ...prev, [key]: value || null }));
	}

	function updatePai<K extends keyof DadosPessoa>(
		key: K,
		value: DadosPessoa[K],
	) {
		setPai((prev) => ({ ...prev, [key]: value || null }));
	}

	function updateMae<K extends keyof DadosPessoa>(
		key: K,
		value: DadosPessoa[K],
	) {
		setMae((prev) => ({ ...prev, [key]: value || null }));
	}

	function updatePadrinho<K extends keyof DadosPadrinhoMadrinha>(
		key: K,
		value: DadosPadrinhoMadrinha[K],
	) {
		setPadrinho((prev) => ({ ...prev, [key]: value || null }));
	}

	function updateControle<K extends keyof ControleAdministrativo>(
		key: K,
		value: ControleAdministrativo[K],
	) {
		setControle((prev) => ({ ...prev, [key]: value || null }));
	}

	function handleSalvar() {
		const novoId = adicionarInscricao({
			crismando,
			pai,
			mae,
			padrinho,
			controle,
		});
		navigate({ to: "/inscritos/$id", params: { id: novoId } });
	}

	return (
		<PageContainer
			title="Novo Inscrito"
			description="Preencha os dados do catecúmeno abaixo"
			actions={
				<Link to="/inscritos">
					<Button variant="secondary" size="sm">
						<ArrowLeft className="h-4 w-4" />
						Voltar
					</Button>
				</Link>
			}
		>
			<div className="flex flex-col gap-4">
				{/* Crismando */}
				<SecaoDados titulo="Dados do Crismando">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Input
							label="Nome *"
							value={crismando.nome ?? ""}
							onChange={(e) => updateCrismando("nome", e.target.value)}
							placeholder="Nome completo"
						/>
						<Input
							label="Data de Nascimento *"
							value={crismando.dataNascimento ?? ""}
							onChange={(e) =>
								updateCrismando("dataNascimento", mascaraData(e.target.value))
							}
							placeholder="DD/MM/AAAA"
							maxLength={10}
						/>
						<Input
							label="Celular *"
							value={crismando.celular ?? ""}
							onChange={(e) =>
								updateCrismando("celular", mascaraTelefone(e.target.value))
							}
							placeholder="(00) 00000-0000"
							maxLength={15}
						/>
						<Select
							label="Sexo *"
							value={crismando.sexo ?? ""}
							onChange={(e) => updateCrismando("sexo", e.target.value)}
							options={OPCOES_SEXO}
							placeholder="Selecione..."
						/>
						<Select
							label="Estado Civil *"
							value={crismando.estadoCivil ?? ""}
							onChange={(e) => updateCrismando("estadoCivil", e.target.value)}
							options={OPCOES_ESTADO_CIVIL}
							placeholder="Selecione..."
						/>
						<Input
							label="Naturalidade"
							value={crismando.naturalidade ?? ""}
							onChange={(e) => updateCrismando("naturalidade", e.target.value)}
						/>
						<Input
							label="Endereço"
							value={crismando.endereco ?? ""}
							onChange={(e) => updateCrismando("endereco", e.target.value)}
						/>
						<Input
							label="Bairro"
							value={crismando.bairro ?? ""}
							onChange={(e) => updateCrismando("bairro", e.target.value)}
						/>
						<Input
							label="Município"
							value={crismando.municipio ?? ""}
							onChange={(e) => updateCrismando("municipio", e.target.value)}
						/>
						<Select
							label="É batizado? *"
							value={
								crismando.batizado === null ? "" : String(crismando.batizado)
							}
							onChange={(e) =>
								updateCrismando(
									"batizado",
									e.target.value === "true"
										? true
										: e.target.value === "false"
											? false
											: null,
								)
							}
							options={OPCOES_SIM_NAO}
							placeholder="Selecione..."
						/>
						<Input
							label="Paróquia do Batismo"
							value={crismando.paroquiaBatismo ?? ""}
							onChange={(e) =>
								updateCrismando("paroquiaBatismo", e.target.value)
							}
						/>
						<Select
							label="Fez 1ª Eucaristia?"
							value={
								crismando.fezPrimeiraEucaristia === null
									? ""
									: String(crismando.fezPrimeiraEucaristia)
							}
							onChange={(e) =>
								updateCrismando(
									"fezPrimeiraEucaristia",
									e.target.value === "true"
										? true
										: e.target.value === "false"
											? false
											: null,
								)
							}
							options={OPCOES_SIM_NAO}
							placeholder="Selecione..."
						/>
						<Input
							label="Paróquia da Eucaristia"
							value={crismando.paroquiaEucaristia ?? ""}
							onChange={(e) =>
								updateCrismando("paroquiaEucaristia", e.target.value)
							}
						/>
						<Input
							label="Dia do Encontro"
							value={crismando.diaEncontro ?? ""}
							onChange={(e) => updateCrismando("diaEncontro", e.target.value)}
							placeholder="Ex: Sábado"
						/>
						<Input
							label="Horário"
							value={crismando.horario ?? ""}
							onChange={(e) => updateCrismando("horario", e.target.value)}
							placeholder="Ex: 16h"
						/>
					</div>
				</SecaoDados>

				{/* Pai */}
				<SecaoDados titulo="Dados do Pai" defaultAberta={false}>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Input
							label="Nome"
							value={pai.nome ?? ""}
							onChange={(e) => updatePai("nome", e.target.value)}
						/>
						<Select
							label="Estado Civil"
							value={pai.estadoCivil ?? ""}
							onChange={(e) => updatePai("estadoCivil", e.target.value)}
							options={OPCOES_ESTADO_CIVIL}
							placeholder="Selecione..."
						/>
						<Input
							label="Naturalidade"
							value={pai.naturalidade ?? ""}
							onChange={(e) => updatePai("naturalidade", e.target.value)}
						/>
						<Input
							label="Endereço"
							value={pai.endereco ?? ""}
							onChange={(e) => updatePai("endereco", e.target.value)}
						/>
						<Input
							label="Bairro"
							value={pai.bairro ?? ""}
							onChange={(e) => updatePai("bairro", e.target.value)}
						/>
						<Input
							label="Município"
							value={pai.municipio ?? ""}
							onChange={(e) => updatePai("municipio", e.target.value)}
						/>
						<Input
							label="Celular"
							value={pai.celular ?? ""}
							maxLength={15}
							onChange={(e) =>
								updatePai("celular", mascaraTelefone(e.target.value))
							}
						/>
					</div>
				</SecaoDados>

				{/* Mãe */}
				<SecaoDados titulo="Dados da Mãe" defaultAberta={false}>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Input
							label="Nome"
							value={mae.nome ?? ""}
							onChange={(e) => updateMae("nome", e.target.value)}
						/>
						<Select
							label="Estado Civil"
							value={mae.estadoCivil ?? ""}
							onChange={(e) => updateMae("estadoCivil", e.target.value)}
							options={OPCOES_ESTADO_CIVIL}
							placeholder="Selecione..."
						/>
						<Input
							label="Naturalidade"
							value={mae.naturalidade ?? ""}
							onChange={(e) => updateMae("naturalidade", e.target.value)}
						/>
						<Input
							label="Endereço"
							value={mae.endereco ?? ""}
							onChange={(e) => updateMae("endereco", e.target.value)}
						/>
						<Input
							label="Bairro"
							value={mae.bairro ?? ""}
							onChange={(e) => updateMae("bairro", e.target.value)}
						/>
						<Input
							label="Município"
							value={mae.municipio ?? ""}
							onChange={(e) => updateMae("municipio", e.target.value)}
						/>
						<Input
							label="Celular"
							value={mae.celular ?? ""}
							maxLength={15}
							onChange={(e) =>
								updateMae("celular", mascaraTelefone(e.target.value))
							}
						/>
					</div>
				</SecaoDados>

				{/* Padrinho */}
				<SecaoDados titulo="Padrinho / Madrinha" defaultAberta={false}>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Input
							label="Nome"
							value={padrinho.nome ?? ""}
							onChange={(e) => updatePadrinho("nome", e.target.value)}
						/>
						<Select
							label="Estado Civil"
							value={padrinho.estadoCivil ?? ""}
							onChange={(e) => updatePadrinho("estadoCivil", e.target.value)}
							options={OPCOES_ESTADO_CIVIL}
							placeholder="Selecione..."
						/>
						<Input
							label="Celular"
							value={padrinho.celular ?? ""}
							maxLength={15}
							onChange={(e) =>
								updatePadrinho("celular", mascaraTelefone(e.target.value))
							}
						/>
						<Input
							label="Endereço"
							value={padrinho.endereco ?? ""}
							onChange={(e) => updatePadrinho("endereco", e.target.value)}
						/>
						<Input
							label="Bairro"
							value={padrinho.bairro ?? ""}
							onChange={(e) => updatePadrinho("bairro", e.target.value)}
						/>
						<Input
							label="Município"
							value={padrinho.municipio ?? ""}
							onChange={(e) => updatePadrinho("municipio", e.target.value)}
						/>
					</div>
				</SecaoDados>

				{/* Controle */}
				<SecaoDados titulo="Controle Administrativo" defaultAberta={false}>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Input
							label="Catequistas"
							value={controle.catequistas ?? ""}
							onChange={(e) => updateControle("catequistas", e.target.value)}
						/>
						<Input
							label="Celebrante"
							value={controle.celebrante ?? ""}
							onChange={(e) => updateControle("celebrante", e.target.value)}
						/>
						<Input
							label="Local"
							value={controle.local ?? ""}
							onChange={(e) => updateControle("local", e.target.value)}
						/>
						<Input
							label="Data"
							value={controle.data ?? ""}
							onChange={(e) => updateControle("data", e.target.value)}
						/>
						<Input
							label="Livro"
							value={controle.livro ?? ""}
							onChange={(e) => updateControle("livro", e.target.value)}
						/>
						<Input
							label="Folha"
							value={controle.folha ?? ""}
							onChange={(e) => updateControle("folha", e.target.value)}
						/>
						<Input
							label="Número"
							value={controle.numero ?? ""}
							onChange={(e) => updateControle("numero", e.target.value)}
						/>
						<Input
							label="Início da Preparação"
							value={controle.inicioPreparacao ?? ""}
							onChange={(e) =>
								updateControle("inicioPreparacao", e.target.value)
							}
						/>
						<Input
							label="Fim da Preparação"
							value={controle.fimPreparacao ?? ""}
							onChange={(e) => updateControle("fimPreparacao", e.target.value)}
						/>
					</div>
				</SecaoDados>

				<div className="sticky bottom-4 flex justify-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
					<Link to="/inscritos">
						<Button variant="secondary">
							<X className="h-4 w-4" />
							Cancelar
						</Button>
					</Link>
					<Button onClick={handleSalvar}>
						<Save className="h-4 w-4" />
						Salvar inscrito
					</Button>
				</div>
			</div>
		</PageContainer>
	);
}
