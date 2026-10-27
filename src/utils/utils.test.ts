import { describe, expect, it } from "vitest";
import { StatusPresenca } from "../types/enums";
import type { Presenca } from "../types/presenca";
import { gerarId } from "./id";
import { calcularIdade, parsearDataBR } from "./mascaras";
import { calcularPercentualFrequencia } from "./presenca";
import { formatarTelefoneWhatsApp } from "./telefone";

describe("parsearDataBR", () => {
	it("lê DD/MM/AAAA no fuso local", () => {
		const d = parsearDataBR("03/05/2010");
		expect(d?.getFullYear()).toBe(2010);
		expect(d?.getMonth()).toBe(4);
		expect(d?.getDate()).toBe(3);
	});

	it("lê D/M/AAAA como dia/mês (não formato americano)", () => {
		const d = parsearDataBR("3/5/2010");
		expect(d?.getMonth()).toBe(4);
		expect(d?.getDate()).toBe(3);
	});

	it("lê ISO sem deslocar o dia", () => {
		const d = parsearDataBR("2010-05-03");
		expect(d?.getDate()).toBe(3);
	});

	it("rejeita datas inexistentes e texto livre", () => {
		expect(parsearDataBR("31/02/2010")).toBeNull();
		expect(parsearDataBR("ontem")).toBeNull();
		expect(parsearDataBR("")).toBeNull();
	});
});

describe("calcularIdade", () => {
	it("retorna null para data inválida", () => {
		expect(calcularIdade("31/02/2010")).toBeNull();
	});

	it("calcula anos completos", () => {
		const hoje = new Date();
		const nasc = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear() - 15}`;
		expect(calcularIdade(nasc)).toBe(15);
	});
});

describe("formatarTelefoneWhatsApp", () => {
	it("adiciona 55 e remove zeros de prefixo", () => {
		expect(formatarTelefoneWhatsApp("(84) 99812-3344")).toBe("5584998123344");
		expect(formatarTelefoneWhatsApp("084 99812-3344")).toBe("5584998123344");
		expect(formatarTelefoneWhatsApp("+55 84 99812-3344")).toBe("5584998123344");
	});
});

describe("calcularPercentualFrequencia", () => {
	const p = (status: StatusPresenca): Presenca => ({
		id: gerarId(),
		encontroId: gerarId(),
		inscritoId: "x",
		status,
		observacoes: null,
		registradoEm: "",
		atualizadoEm: "",
	});

	it("ignora presenças pendentes no denominador", () => {
		expect(
			calcularPercentualFrequencia([
				p(StatusPresenca.PRESENTE),
				p(StatusPresenca.AUSENTE),
				p(StatusPresenca.PENDENTE),
			]),
		).toBe(50);
	});

	it("conta falta justificada por padrão", () => {
		expect(
			calcularPercentualFrequencia([
				p(StatusPresenca.PRESENTE),
				p(StatusPresenca.FALTA_JUSTIFICADA),
			]),
		).toBe(100);
	});

	it("retorna null sem chamada feita", () => {
		expect(calcularPercentualFrequencia([p(StatusPresenca.PENDENTE)])).toBeNull();
	});
});
