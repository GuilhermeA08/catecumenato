import { CheckCircle2, ClipboardCopy } from "lucide-react";
import { gerarMensagemWhatsApp } from "../../features/inscricoes/services/whatsappService";
import type { Inscricao } from "../../types/inscricao";
import { copiarParaClipboard } from "../../utils/clipboard";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { toast } from "../ui/Toast";

/** Progresso da ficha e lista dos campos obrigatórios ainda vazios */
export function OQueFaltaCard({ inscricao }: { inscricao: Inscricao }) {
	const faltantes = inscricao.camposFaltantes;

	async function copiarMensagem() {
		if (await copiarParaClipboard(gerarMensagemWhatsApp(inscricao))) {
			toast.sucesso("Mensagem de cobrança copiada.");
		} else {
			toast.erro("Não foi possível copiar a mensagem.");
		}
	}

	return (
		<Card>
			<CardHeader
				title="O que falta"
				description={
					faltantes.length === 0
						? "Todos os campos obrigatórios foram preenchidos."
						: `${faltantes.length} campo${faltantes.length > 1 ? "s" : ""} obrigatório${faltantes.length > 1 ? "s" : ""} em branco.`
				}
			/>
			<CardContent className="flex flex-col gap-4">
				<ProgressBar
					value={inscricao.completude}
					label="Ficha preenchida"
					size="md"
				/>
				{faltantes.length > 0 ? (
					<>
						<ul className="flex flex-col gap-2">
							{faltantes.map((campo) => (
								<li key={campo} className="flex items-center gap-2.5 text-sm">
									<span
										className="size-4 shrink-0 rounded-[5px] shadow-[inset_0_0_0_1.5px_var(--color-faint)]"
										aria-hidden="true"
									/>
									{campo}
								</li>
							))}
						</ul>
						<Button variant="secondary" onClick={copiarMensagem}>
							<ClipboardCopy />
							Copiar mensagem de cobrança
						</Button>
					</>
				) : (
					<p className="flex items-center gap-2 text-sm text-ok-ink">
						<CheckCircle2 className="size-4" aria-hidden="true" />
						Ficha completa
					</p>
				)}
			</CardContent>
		</Card>
	);
}
