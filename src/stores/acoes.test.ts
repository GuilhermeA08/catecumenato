import { beforeEach, describe, expect, it } from "vitest";
import { StatusPresenca } from "../types/enums";
import type { Inscricao } from "../types/inscricao";
import {
	aplicarImportacao,
	excluirInscricao,
	excluirTurma,
	limparTudo,
	mesclarInscricoes,
	vincularTurma,
} from "./acoes";
import { useEncontrosStore } from "./encontrosStore";
import { useInscricoesStore } from "./inscricoesStore";
import { usePresencasStore } from "./presencasStore";
import { useTurmasStore } from "./turmasStore";

function inscricao(id: string, nome: string, nasc: string | null = null): Inscricao {
	const vazio = {
		nome: null,
		estadoCivil: null,
		naturalidade: null,
		endereco: null,
		bairro: null,
		municipio: null,
		celular: null,
	};
	return {
		id,
		turmaId: null,
		crismando: {
			...vazio,
			nome,
			sexo: null,
			dataNascimento: nasc,
			batizado: null,
			paroquiaBatismo: null,
			fezPrimeiraEucaristia: null,
			paroquiaEucaristia: null,
			diaEncontro: null,
			horario: null,
		},
		pai: vazio,
		mae: vazio,
		padrinho: { ...vazio },
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
		status: "pendente" as Inscricao["status"],
		statusOverride: false,
		completude: 0,
		camposFaltantes: [],
		atualizadoEm: "",
	};
}

function criarCenario() {
	useInscricoesStore.getState().setInscricoes([
		inscricao("a", "Ana Clara", "01/02/2010"),
		inscricao("b", "Bruno Costa"),
	]);
	const turmaId = useTurmasStore.getState().criarTurma({ nome: "Sábado" });
	vincularTurma("a", turmaId);
	vincularTurma("b", turmaId);
	const encontroId = useEncontrosStore.getState().criarEncontro({
		turmaId,
		dataEncontro: "2026-03-08",
		horarioInicio: "08:00",
		horarioFim: null,
		local: null,
		observacoes: null,
	});
	return { turmaId, encontroId };
}

beforeEach(() => {
	limparTudo();
});

describe("cascatas", () => {
	it("criar encontro gera presenças pendentes para os membros", () => {
		const { encontroId } = criarCenario();
		expect(usePresencasStore.getState().getByEncontro(encontroId)).toHaveLength(2);
	});

	it("excluir inscrição remove suas presenças", () => {
		criarCenario();
		excluirInscricao("a");
		expect(usePresencasStore.getState().getByInscrito("a")).toHaveLength(0);
	});

	it("excluir turma remove encontros, presenças e desvincula membros", () => {
		const { turmaId } = criarCenario();
		excluirTurma(turmaId);
		expect(useEncontrosStore.getState().encontros).toHaveLength(0);
		expect(usePresencasStore.getState().presencas).toHaveLength(0);
		expect(useInscricoesStore.getState().getById("a")?.turmaId).toBeNull();
	});

	it("trocar de turma mantém presenças registradas e remove pendentes", () => {
		const { encontroId } = criarCenario();
		usePresencasStore
			.getState()
			.definirStatus(encontroId, "a", StatusPresenca.PRESENTE);
		vincularTurma("a", null);
		vincularTurma("b", null);
		expect(usePresencasStore.getState().getByInscrito("a")).toHaveLength(1);
		expect(usePresencasStore.getState().getByInscrito("b")).toHaveLength(0);
	});

	it("entrar numa turma cria presenças pendentes nos encontros existentes", () => {
		const { turmaId } = criarCenario();
		useInscricoesStore.setState((s) => ({
			inscricoes: [...s.inscricoes, inscricao("c", "Caio")],
		}));
		vincularTurma("c", turmaId);
		expect(usePresencasStore.getState().getByInscrito("c")).toHaveLength(1);
	});

	it("limparTudo zera os quatro stores", () => {
		criarCenario();
		limparTudo();
		expect(useInscricoesStore.getState().inscricoes).toHaveLength(0);
		expect(useTurmasStore.getState().turmas).toHaveLength(0);
		expect(useEncontrosStore.getState().encontros).toHaveLength(0);
		expect(usePresencasStore.getState().presencas).toHaveLength(0);
	});
});

describe("importação", () => {
	it("mesclar mantém o id, a turma e as presenças existentes", () => {
		const { turmaId } = criarCenario();
		aplicarImportacao(
			[inscricao("novo-a", "ana clara", "01/02/2010"), inscricao("d", "Davi")],
			"mesclar",
		);
		const lista = useInscricoesStore.getState().inscricoes;
		expect(lista).toHaveLength(3);
		const ana = lista.find((i) => i.id === "a");
		expect(ana?.turmaId).toBe(turmaId);
		expect(usePresencasStore.getState().getByInscrito("a")).toHaveLength(1);
	});

	it("casa só pelo nome quando a data falta em um dos lados", () => {
		const { resultado, casadas } = mesclarInscricoes(
			[inscricao("b", "Bruno Costa")],
			[inscricao("x", "Bruno  Costa", "05/06/2011")],
		);
		expect(casadas).toBe(1);
		expect(resultado[0]?.id).toBe("b");
	});

	it("importação sem linhas válidas não apaga nada", () => {
		criarCenario();
		aplicarImportacao([], "substituir");
		aplicarImportacao([inscricao("z", "")], "substituir");
		expect(useInscricoesStore.getState().inscricoes).toHaveLength(2);
	});

	it("substituir remove presenças dos inscritos antigos", () => {
		criarCenario();
		aplicarImportacao([inscricao("z", "Zeca")], "substituir");
		expect(useInscricoesStore.getState().inscricoes).toHaveLength(1);
		expect(usePresencasStore.getState().presencas).toHaveLength(0);
	});
});
