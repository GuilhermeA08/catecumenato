/**
 * Aplica máscara de data DD/MM/AAAA enquanto o usuário digita.
 * Aceita o valor atual do input e retorna o valor formatado.
 */
export function mascaraData(valor: string): string {
	// Remove tudo que não for dígito
	const digits = valor.replace(/\D/g, "").slice(0, 8);

	if (digits.length <= 2) return digits;
	if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
	return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Aplica máscara de telefone (XX) XXXXX-XXXX enquanto o usuário digita.
 * Suporta celular (11 dígitos) e fixo (10 dígitos).
 */
export function mascaraTelefone(valor: string): string {
	const digits = valor.replace(/\D/g, "").slice(0, 11);

	if (digits.length === 0) return "";
	if (digits.length <= 2) return `(${digits}`;
	if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	if (digits.length <= 10)
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	// 11 dígitos → celular (9 dígitos locais)
	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Converte data no formato DD/MM/AAAA para objeto Date.
 * Retorna null se inválida.
 */
export function parsearDataBR(valor: string | null | undefined): Date | null {
	if (!valor) return null;
	const texto = valor.trim();

	// D/M/AAAA ou DD/MM/AAAA (também aceita "-" e "." como separador)
	const br = texto.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
	if (br) return criarDataLocal(Number(br[3]), Number(br[2]), Number(br[1]));

	// ISO AAAA-MM-DD (com ou sem horário) — interpretado no fuso local
	const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
	if (iso) return criarDataLocal(Number(iso[1]), Number(iso[2]), Number(iso[3]));

	return null;
}

// Cria a data no fuso local e rejeita datas inexistentes (ex.: 31/02)
function criarDataLocal(ano: number, mes: number, dia: number): Date | null {
	const d = new Date(ano, mes - 1, dia);
	if (
		d.getFullYear() !== ano ||
		d.getMonth() !== mes - 1 ||
		d.getDate() !== dia
	) {
		return null;
	}
	return d;
}

/**
 * Calcula a idade em anos completos a partir de uma data de nascimento.
 * Retorna null se a data não puder ser interpretada.
 */
export function calcularIdade(
	dataNascimento: string | null | undefined,
): number | null {
	const nascimento = parsearDataBR(dataNascimento);
	if (!nascimento) return null;

	const hoje = new Date();
	let idade = hoje.getFullYear() - nascimento.getFullYear();
	const mesAntes =
		hoje.getMonth() < nascimento.getMonth() ||
		(hoje.getMonth() === nascimento.getMonth() &&
			hoje.getDate() < nascimento.getDate());
	if (mesAntes) idade--;

	return idade >= 0 && idade < 150 ? idade : null;
}
