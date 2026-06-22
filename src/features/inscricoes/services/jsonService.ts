import { useEncontrosStore } from "../../../stores/encontrosStore";
import { useInscricoesStore } from "../../../stores/inscricoesStore";
import { usePresencasStore } from "../../../stores/presencasStore";
import { useTurmasStore } from "../../../stores/turmasStore";
import type { Encontro } from "../../../types/encontro";
import type { Inscricao } from "../../../types/inscricao";
import type { Presenca } from "../../../types/presenca";
import type { Turma } from "../../../types/turma";

interface DadosExportacao {
	versao: number;
	exportadoEm: string;
	turmas: Turma[];
	inscricoes: Inscricao[];
	encontros: Encontro[];
	presencas: Presenca[];
}

const VERSAO = 1;

export function exportarJSON(): void {
	const turmas = useTurmasStore.getState().turmas;
	const inscricoes = useInscricoesStore.getState().inscricoes;
	const encontros = useEncontrosStore.getState().encontros;
	const presencas = usePresencasStore.getState().presencas;

	const dados: DadosExportacao = {
		versao: VERSAO,
		exportadoEm: new Date().toISOString(),
		turmas,
		inscricoes,
		encontros,
		presencas,
	};

	const json = JSON.stringify(dados, null, 2);
	const hoje = new Date().toISOString().split("T")[0];
	const nomeArquivo = `catecumenato_backup_${hoje}.json`;

	const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", nomeArquivo);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function importarJSON(
	file: File,
): Promise<{ sucesso: boolean; mensagem: string }> {
	return new Promise((resolve) => {
		const reader = new FileReader();

		reader.onload = (evento) => {
			try {
				const texto = evento.target?.result as string;
				const dados = JSON.parse(texto) as DadosExportacao;

				if (
					!dados.versao ||
					!Array.isArray(dados.turmas) ||
					!Array.isArray(dados.inscricoes) ||
					!Array.isArray(dados.encontros) ||
					!Array.isArray(dados.presencas)
				) {
					resolve({
						sucesso: false,
						mensagem:
							"Arquivo inválido. Estrutura de dados não reconhecida.",
					});
					return;
				}

				useTurmasStore.setState({ turmas: dados.turmas });
				useEncontrosStore.setState({ encontros: dados.encontros });
				usePresencasStore.setState({ presencas: dados.presencas });
				useInscricoesStore.getState().setInscricoes(dados.inscricoes);

				resolve({
					sucesso: true,
					mensagem: `Dados restaurados com sucesso: ${dados.turmas.length} turmas, ${dados.inscricoes.length} inscrições, ${dados.encontros.length} encontros, ${dados.presencas.length} presenças.`,
				});
			} catch (erro) {
				resolve({
					sucesso: false,
					mensagem: `Erro ao ler arquivo: ${erro instanceof Error ? erro.message : "Erro desconhecido"}`,
				});
			}
		};

		reader.onerror = () => {
			resolve({
				sucesso: false,
				mensagem: "Erro ao ler o arquivo.",
			});
		};

		reader.readAsText(file);
	});
}
