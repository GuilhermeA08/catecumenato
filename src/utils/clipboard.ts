// Copia texto para o clipboard do navegador
export async function copiarParaClipboard(texto: string): Promise<boolean> {
	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(texto);
			return true;
		}
		// Fallback para ambientes sem HTTPS
		const textArea = document.createElement("textarea");
		textArea.value = texto;
		textArea.style.position = "fixed";
		textArea.style.opacity = "0";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		const sucesso = document.execCommand("copy");
		document.body.removeChild(textArea);
		return sucesso;
	} catch {
		return false;
	}
}
