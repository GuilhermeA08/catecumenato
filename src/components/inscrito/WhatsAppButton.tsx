import { MessageCircle } from "lucide-react";
import { abrirWhatsApp } from "../../features/inscricoes/services/whatsappService";
import type { Inscricao } from "../../types/inscricao";
import { Button, type ButtonVariantProps } from "../ui/Button";

interface WhatsAppButtonProps {
	inscricao: Inscricao;
	/** Texto do botão; sem ele vira botão só de ícone */
	label?: string;
	variant?: ButtonVariantProps["variant"];
	size?: ButtonVariantProps["size"];
}

export function WhatsAppButton({
	inscricao,
	label,
	variant = "secondary",
	size,
}: WhatsAppButtonProps) {
	const nome = inscricao.crismando.nome ?? "inscrito";
	const temCelular = !!inscricao.crismando.celular?.trim();
	const titulo = temCelular
		? `Enviar WhatsApp para ${nome}`
		: "Celular não cadastrado";

	return (
		<Button
			variant={variant}
			size={size ?? (label ? "md" : "icon-sm")}
			onClick={() => abrirWhatsApp(inscricao)}
			disabled={!temCelular}
			title={titulo}
			aria-label={label ? undefined : titulo}
		>
			<MessageCircle />
			{label}
		</Button>
	);
}
