import type { Inscricao } from "../../../types/inscricao";
import { formatarTelefoneWhatsApp } from "../../../utils/telefone";

// Gera o texto da mensagem de WhatsApp com os campos faltantes
export function gerarMensagemWhatsApp(inscricao: Inscricao): string {
	const nome = inscricao.crismando.nome ?? "inscrito(a)";
	const faltantes = inscricao.camposFaltantes;

	if (faltantes.length === 0) {
		return `Olá ${nome}! Sua inscrição na Crisma está completa. Em breve entraremos em contato com mais informações. 🙏`;
	}

	const lista = faltantes.map((campo: string) => `• ${campo}`).join("\n");

	return (
		`Olá, ${nome}! Tudo bem?\n\n` +
		`Para concluir sua inscrição na Crisma precisamos das seguintes informações:\n\n` +
		`${lista}\n\n` +
		`Por favor, responda esta mensagem com os dados solicitados. Obrigado! 🙏`
	);
}

// Gera o link completo de WhatsApp com mensagem URL-encoded
export function gerarLinkWhatsApp(inscricao: Inscricao): string | null {
	const numero = formatarTelefoneWhatsApp(inscricao.crismando.celular);
	if (!numero) return null;

	const mensagem = gerarMensagemWhatsApp(inscricao);
	const mensagemCodificada = encodeURIComponent(mensagem);

	return `https://wa.me/${numero}?text=${mensagemCodificada}`;
}

// Abre o WhatsApp diretamente
export function abrirWhatsApp(inscricao: Inscricao): boolean {
	const link = gerarLinkWhatsApp(inscricao);
	if (!link) return false;
	window.open(link, "_blank", "noopener,noreferrer");
	return true;
}
