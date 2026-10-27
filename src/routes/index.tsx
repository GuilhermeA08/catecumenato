import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Download, FileText, Trash2, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import { CSVUploader } from "../components/csv/CSVUploader";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { confirmar } from "../components/ui/Dialog";
import { toast } from "../components/ui/Toast";
import { exportarTemplate } from "../features/inscricoes/services/csvService";
import {
	exportarJSON,
	lerBackupJSON,
	obterUltimoBackup,
	restaurarBackup,
} from "../features/inscricoes/services/jsonService";
import { exportarFichaEmBrancoPDF } from "../features/inscricoes/services/pdfService";
import { limparTudo } from "../stores/acoes";
import { useInscricoesStore } from "../stores/inscricoesStore";
import { useTurmasStore } from "../stores/turmasStore";

export const Route = createFileRoute("/")({ component: ImportarPage });

function formatarData(iso: string | null): string | null {
	return iso ? new Date(iso).toLocaleDateString("pt-BR") : null;
}

function ImportarPage() {
	const navigate = useNavigate();
	const inscricoes = useInscricoesStore((s) => s.inscricoes);
	const exportarCSV = useInscricoesStore((s) => s.exportar);
	const totalTurmas = useTurmasStore((s) => s.turmas.length);
	const temDados = inscricoes.length > 0;
	const backupRef = useRef<HTMLInputElement>(null);
	const [ultimoBackup, setUltimoBackup] = useState(obterUltimoBackup);

	function baixarBackup() {
		exportarJSON();
		setUltimoBackup(obterUltimoBackup());
		toast.sucesso("Backup baixado.");
	}

	async function restaurar(file: File) {
		if (!file.name.toLowerCase().endsWith(".json")) {
			toast.erro("Escolha um arquivo de backup .json");
			return;
		}
		const leitura = await lerBackupJSON(file);
		if (!leitura.sucesso) {
			toast.erro(leitura.mensagem);
			return;
		}
		const { dados } = leitura;
		const exportadoEm = formatarData(dados.exportadoEm);
		const ok = await confirmar({
			titulo: "Restaurar backup?",
			descricao: (
				<>
					O backup{exportadoEm && ` de ${exportadoEm}`} tem {dados.inscricoes.length}{" "}
					inscrições, {dados.turmas.length} turmas e {dados.encontros.length}{" "}
					encontros. <strong>Todos os dados atuais serão substituídos.</strong>
				</>
			),
			confirmar: "Restaurar",
			perigo: temDados,
		});
		if (!ok) return;
		restaurarBackup(dados);
		setUltimoBackup(obterUltimoBackup());
		toast.sucesso("Backup restaurado.");
		navigate({ to: "/dashboard" });
	}

	async function apagarTudo() {
		const ok = await confirmar({
			titulo: "Apagar todos os dados?",
			descricao: `Isso remove ${inscricoes.length} inscrições, ${totalTurmas} turmas, encontros e presenças deste navegador. Não pode ser desfeito — baixe um backup antes.`,
			confirmar: "Apagar tudo",
			perigo: true,
		});
		if (!ok) return;
		limparTudo();
		toast.info("Todos os dados foram apagados.");
	}

	return (
		<PageContainer
			width="narrow"
			title={temDados ? "Importar e backup" : "Bem-vindo ao Catecumenato"}
			description={
				temDados
					? "Os dados ficam salvos apenas neste navegador. Faça backup com frequência para não perder nada."
					: "Organize as inscrições da Crisma, as turmas e a frequência nos encontros. Comece importando a planilha de inscrições ou cadastrando manualmente."
			}
			actions={
				temDados && (
					<ButtonLink to="/dashboard" variant="secondary">
						Ir para o painel
						<ArrowRight />
					</ButtonLink>
				)
			}
		>
			<Card>
				<CardHeader title="Importar planilha de inscrições" />
				<CardContent className="flex flex-col gap-4">
					<CSVUploader onConcluido={() => navigate({ to: "/dashboard" })} />
					<div className="flex flex-wrap gap-2">
						<Button variant="secondary" size="sm" onClick={exportarTemplate}>
							<Download />
							Baixar modelo CSV
						</Button>
						<ButtonLink to="/inscritos/novo" variant="secondary" size="sm">
							<UserPlus />
							Cadastrar manualmente
						</ButtonLink>
						<Button variant="secondary" size="sm" onClick={exportarFichaEmBrancoPDF}>
							<FileText />
							Ficha em branco (PDF)
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader
					title="Backup completo"
					description={
						<>
							Inclui inscritos, turmas, encontros e presenças.{" "}
							{ultimoBackup
								? `Último backup em ${formatarData(ultimoBackup)}.`
								: temDados && "Nenhum backup feito ainda."}
						</>
					}
				/>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-wrap gap-2">
						<Button variant="dark" onClick={baixarBackup} disabled={!temDados}>
							Baixar backup (.json)
						</Button>
						<Button variant="secondary" onClick={() => backupRef.current?.click()}>
							Restaurar backup
						</Button>
						<Button variant="secondary" onClick={exportarCSV} disabled={!temDados}>
							Exportar CSV
						</Button>
						<input
							ref={backupRef}
							type="file"
							accept=".json,application/json"
							className="sr-only"
							tabIndex={-1}
							aria-hidden="true"
							onChange={(e) => {
								const file = e.target.files?.[0];
								e.target.value = "";
								if (file) void restaurar(file);
							}}
						/>
					</div>
					{temDados && (
						<div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
							<span className="text-[13px] text-muted">
								Apagar todos os dados deste navegador
							</span>
							<Button variant="danger" size="sm" onClick={apagarTudo}>
								<Trash2 />
								Apagar tudo…
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{!temDados && (
				<Card>
					<CardHeader title="Como usar" />
					<CardContent>
						<ol className="m-0 flex list-decimal flex-col gap-2 pl-5 text-ink-2">
							<li>Baixe o modelo CSV e preencha com os dados dos inscritos.</li>
							<li>Importe o arquivo aqui e revise a prévia.</li>
							<li>No painel, veja quem está com a ficha incompleta.</li>
							<li>Use o WhatsApp para pedir os dados que faltam.</li>
							<li>
								Crie as <Link to="/turmas" className="text-accent">turmas</Link>,
								registre os encontros e faça a chamada.
							</li>
						</ol>
					</CardContent>
				</Card>
			)}
		</PageContainer>
	);
}
