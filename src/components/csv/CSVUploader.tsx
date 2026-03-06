import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";
import {
	exportarTemplate,
	parseCSV,
} from "../../features/inscricoes/services/csvService";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";

export function CSVUploader() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resultado, setResultado] = useState<{
		total: number;
		erros: string[];
	} | null>(null);
	const setInscricoes = useInscricoesStore((s) => s.setInscricoes);
	const { criarTurma } = useTurmasStore();

	function resolverTurma(nome: string): string {
		const nomeNorm = nome.trim().toLowerCase();

		// 1. Busca no estado ATUAL do store (estado fresco, não o closure)
		const turmasAtuais = useTurmasStore.getState().turmas;
		const existente = turmasAtuais.find(
			(t) => t.nome.trim().toLowerCase() === nomeNorm,
		);
		if (existente) return existente.id;

		// 2. Cria nova turma e retorna o id
		return criarTurma({ nome: nome.trim() });
	}

	async function processarArquivo(file: File) {
		if (!file.name.endsWith(".csv")) {
			setResultado({ total: 0, erros: ["O arquivo deve ser um CSV (.csv)"] });
			return;
		}

		setLoading(true);
		setResultado(null);

		const { inscricoes, erros } = await parseCSV(file, resolverTurma);
		setInscricoes(inscricoes);
		setResultado({ total: inscricoes.length, erros });
		setLoading(false);
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) processarArquivo(file);
	}

	function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) processarArquivo(file);
	}

	return (
		<div className="flex flex-col gap-4">
			<button
				type="button"
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
				}}
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleDrop}
				onClick={() => inputRef.current?.click()}
				className={cn(
					"flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10",
					"transition-colors duration-150",
					isDragging
						? "border-blue-400 bg-blue-50"
						: "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
				)}
			>
				<div
					className={cn(
						"flex h-14 w-14 items-center justify-center rounded-full",
						isDragging ? "bg-blue-100" : "bg-white shadow",
					)}
				>
					<Upload
						className={cn(
							"h-6 w-6",
							isDragging ? "text-blue-500" : "text-gray-400",
						)}
					/>
				</div>
				<div className="text-center">
					<p className="font-semibold text-gray-700">
						{isDragging
							? "Solte o arquivo aqui"
							: "Arraste e solte ou clique para selecionar"}
					</p>
					<p className="mt-1 text-sm text-gray-500">
						Apenas arquivos .CSV são aceitos
					</p>
				</div>
				<input
					ref={inputRef}
					type="file"
					accept=".csv"
					className="hidden"
					onChange={handleFileChange}
					onClick={(e) => {
						(e.target as HTMLInputElement).value = "";
					}}
				/>
			</button>

			{loading && (
				<div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
					<svg
						className="h-5 w-5 animate-spin text-blue-500"
						viewBox="0 0 24 24"
						fill="none"
						aria-label="Carregando"
						role="img"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
					<span className="text-sm text-blue-700">Processando arquivo...</span>
				</div>
			)}

			{resultado && (
				<div className="flex flex-col gap-3">
					{resultado.total > 0 && (
						<div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
							<CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
							<div>
								<p className="text-sm font-medium text-green-800">
									{resultado.total} inscrição{resultado.total > 1 ? "ões" : ""}{" "}
									importada{resultado.total > 1 ? "s" : ""} com sucesso!
								</p>
								{resultado.erros.length > 0 && (
									<p className="text-xs text-green-700 mt-0.5">
										{resultado.erros.length} linha(s) com erro foram ignoradas.
									</p>
								)}
							</div>
						</div>
					)}
					{resultado.erros.length > 0 && resultado.total === 0 && (
						<div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
							<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
							<div>
								<p className="text-sm font-medium text-red-800">
									Erro ao processar o arquivo
								</p>
								<ul className="mt-1 list-disc pl-4">
									{resultado.erros.slice(0, 5).map((e) => (
										<li key={e} className="text-xs text-red-700">
											{e}
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</div>
			)}

			<div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
				<FileText className="h-5 w-5 shrink-0 text-gray-400" />
				<div className="flex-1">
					<p className="text-sm font-medium text-gray-700">
						Precisa de um modelo?
					</p>
					<p className="text-xs text-gray-500">
						Baixe o CSV modelo com todas as colunas já configuradas
					</p>
				</div>
				<Button variant="secondary" size="sm" onClick={exportarTemplate}>
					Baixar modelo
				</Button>
			</div>
		</div>
	);
}
