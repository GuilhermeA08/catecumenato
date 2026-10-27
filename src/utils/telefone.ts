// Remove todos os caracteres não numéricos do telefone
export function limparTelefone(telefone: string | null | undefined): string {
	if (!telefone) return "";
	return telefone.replace(/\D/g, "");
}

// Formata número de telefone para exibição (XX) XXXXX-XXXX
export function formatarTelefone(telefone: string | null | undefined): string {
	const limpo = limparTelefone(telefone);
	if (!limpo) return "";

	if (limpo.length === 11) {
		return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
	}
	if (limpo.length === 10) {
		return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
	}
	return limpo;
}

// Gera número no formato 55XX... para WhatsApp
export function formatarTelefoneWhatsApp(
	telefone: string | null | undefined,
): string {
	// Remove zeros de prefixo de operadora/DDD (ex.: "084...")
	const limpo = limparTelefone(telefone).replace(/^0+/, "");
	if (!limpo) return "";
	// Já tem código do país (55 + DDD + número)
	if (limpo.startsWith("55") && limpo.length >= 12) {
		return limpo;
	}
	return `55${limpo}`;
}
