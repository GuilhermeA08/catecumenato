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
	// Tenta DD/MM/AAAA
	const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (match) {
		const [, dia, mes, ano] = match;
		const d = new Date(Number(ano), Number(mes) - 1, Number(dia));
		if (!Number.isNaN(d.getTime())) return d;
	}
	// Tenta ISO AAAA-MM-DD
	const iso = new Date(valor);
	if (!Number.isNaN(iso.getTime())) return iso;
	return null;
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
