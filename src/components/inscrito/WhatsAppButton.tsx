import { AlertCircle, MessageCircle } from "lucide-react";
import { abrirWhatsApp } from "../../features/inscricoes/services/whatsappService";
import type { Inscricao } from "../../types/inscricao";
import { Button } from "../ui/Button";

interface WhatsAppButtonProps {
	inscricao: Inscricao;
	size?: "sm" | "md" | "lg";
	showLabel?: boolean;
}

export function WhatsAppButton({
	inscricao,
	size = "md",
	showLabel = true,
}: WhatsAppButtonProps) {
	const temCelular = !!inscricao.crismando.celular?.trim();

	if (!temCelular) {
		return (
			<Button
				variant="secondary"
				size={size}
				disabled
				title="Celular não cadastrado"
				className="cursor-not-allowed"
			>
				<AlertCircle className="h-4 w-4 text-gray-400" />
				{showLabel && "Sem celular"}
			</Button>
		);
	}

	return (
		<Button
			variant="whatsapp"
			size={size}
			onClick={() => abrirWhatsApp(inscricao)}
			title={`Enviar WhatsApp para ${inscricao.crismando.nome}`}
		>
			<MessageCircle className="h-4 w-4" />
			{showLabel && "WhatsApp"}
		</Button>
	);
}
