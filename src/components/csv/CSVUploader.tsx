import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { parseCSV } from "../../features/inscricoes/services/csvService";
import {
	aplicarImportacao,
	type PreviaImportacao,
	previaImportacao,
} from "../../stores/acoes";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";
import type { Inscricao } from "../../types/inscricao";
import { cn } from "../../utils/cn";
import { Button, Spinner } from "../ui/Button";
import { toast } from "../ui/Toast";

interface Leitura {
	arquivo: string;
	inscricoes: Inscricao[];
	erros: string[];
	previa: PreviaImportacao;
	turmasNovas: string[];
}

/** Arrastar/soltar CSV → prévia → mesclar ou substituir */
export function CSVUploader({ onConcluido }: { onConcluido?: () => void }) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [arrastando, setArrastando] = useState(false);
	const [lendo, setLendo] = useState(false);
	const [leitura, setLeitura] = useState<Leitura | null>(null);
	const [modo, setModo] = useState<"mesclar" | "substituir">("mesclar");
	const existentes = useInscricoesStore((s) => s.inscricoes);

	async function processarArquivo(file: File) {
		if (!file.name.toLowerCase().endsWith(".csv")) {
			toast.erro("Escolha um arquivo .csv");
			return;
		}
		setLendo(true);

		// Resolve turmas pelo nome sem criá-las ainda (só ao confirmar)
		const turmasAtuais = useTurmasStore.getState().turmas;
		const turmasNovas = new Map<string, string>();
		const resolverTurma = (nome: string) => {
			const norm = nome.trim().toLowerCase();
			const existente = turmasAtuais.find((t) => t.nome.trim().toLowerCase() === norm);
			if (existente) return existente.id;
			const chave = `nova:${norm}`;
			if (!turmasNovas.has(chave)) turmasNovas.set(chave, nome.trim());
			return chave;
		};

		const { inscricoes, erros } = await parseCSV(file, resolverTurma);
		setLendo(false);

		if (inscricoes.length === 0) {
			toast.erro(
				erros[0] ?? "Nenhuma inscrição encontrada no arquivo. Confira o modelo CSV.",
			);
			return;
		}

		setModo(existentes.length > 0 ? "mesclar" : "substituir");
		setLeitura({
			arquivo: file.name,
			inscricoes,
			erros,
			previa: previaImportacao(existentes, inscricoes),
			turmasNovas: [...turmasNovas.values()],
		});
	}

	function confirmar() {
		if (!leitura) return;
		// Cria as turmas novas e troca os ids provisórios
		const criadas = new Map<string, string>();
		for (const nome of leitura.turmasNovas) {
			criadas.set(
				`nova:${nome.toLowerCase()}`,
				useTurmasStore.getState().criarTurma({ nome }),
			);
		}
		const inscricoes = leitura.inscricoes.map((i) =>
			i.turmaId?.startsWith("nova:")
				? { ...i, turmaId: criadas.get(i.turmaId) ?? null }
				: i,
		);
		aplicarImportacao(inscricoes, modo);
		const total = leitura.previa.novos + leitura.previa.atualizados;
		toast.sucesso(
			`${total} inscrição${total !== 1 ? "ões" : ""} importada${total !== 1 ? "s" : ""}.`,
		);
		setLeitura(null);
		onConcluido?.();
	}

	if (leitura) {
		const { previa } = leitura;
		const substituir = modo === "substituir";
		const total = previa.novos + previa.atualizados;
		return (
			<section
				aria-label="Prévia da importação"
				className="flex flex-col gap-4 animate-fade-in"
			>
				<div className="flex flex-wrap items-baseline justify-between gap-3">
					<h3 className="font-serif text-lg font-medium break-all">{leitura.arquivo}</h3>
					<span className="text-[13px] text-muted">
						{leitura.inscricoes.length + leitura.erros.length} linhas lidas
					</span>
				</div>
				<div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
					{existentes.length > 0 && (
						<Numero valor={previa.atualizados} texto="já existem (serão atualizados)" />
					)}
					<Numero
						valor={existentes.length > 0 ? previa.novos : previa.novos + previa.atualizados}
						texto="novos inscritos"
					/>
					{previa.ignorados + leitura.erros.length > 0 && (
						<Numero
							valor={previa.ignorados + leitura.erros.length}
							texto="linhas ignoradas (sem nome ou com erro)"
							alerta
						/>
					)}
				</div>
				{leitura.turmasNovas.length > 0 && (
					<p className="text-[13px] text-muted">
						Turmas que serão criadas: {leitura.turmasNovas.join(", ")}
					</p>
				)}

				{existentes.length > 0 && (
					<fieldset className="flex flex-col gap-2">
						<legend className="mb-2 font-medium">Como aplicar</legend>
						<OpcaoModo
							ativo={modo === "mesclar"}
							onSelect={() => setModo("mesclar")}
							titulo="Mesclar"
						>
							Atualiza quem já existe e adiciona os novos. Presenças e turmas são
							mantidas.
						</OpcaoModo>
						<OpcaoModo
							ativo={modo === "substituir"}
							onSelect={() => setModo("substituir")}
							titulo="Substituir tudo"
						>
							Apaga os {existentes.length} inscritos atuais e as presenças ligadas a
							eles.
						</OpcaoModo>
					</fieldset>
				)}

				<div className="flex flex-wrap justify-end gap-2">
					<Button variant="secondary" onClick={() => setLeitura(null)}>
						Cancelar
					</Button>
					<Button
						variant={substituir && existentes.length > 0 ? "danger-solid" : "primary"}
						onClick={confirmar}
					>
						{substituir && existentes.length > 0
							? `Substituir por ${total}`
							: `Importar ${total} inscriç${total !== 1 ? "ões" : "ão"}`}
					</Button>
				</div>
			</section>
		);
	}

	return (
		<label
			onDragOver={(e) => {
				e.preventDefault();
				setArrastando(true);
			}}
			onDragLeave={() => setArrastando(false)}
			onDrop={(e) => {
				e.preventDefault();
				setArrastando(false);
				const file = e.dataTransfer.files[0];
				if (file) void processarArquivo(file);
			}}
			className={cn(
				"flex cursor-pointer flex-col items-center gap-2.5 rounded-[14px] border-[1.5px] border-dashed px-5 py-9 text-center transition-colors",
				"focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/15",
				arrastando
					? "border-accent bg-accent-soft/50"
					: "border-faint/70 bg-bg hover:border-accent/60",
			)}
		>
			{lendo ? (
				<Spinner className="size-8 text-accent" />
			) : (
				<Upload className="size-8 text-accent" strokeWidth={1.6} aria-hidden="true" />
			)}
			<span className="text-[15px] font-medium">
				{lendo
					? "Lendo arquivo…"
					: arrastando
						? "Solte o arquivo aqui"
						: "Arraste o arquivo CSV aqui ou clique para escolher"}
			</span>
			<span className="text-[13px] text-muted">
				Você poderá revisar antes de aplicar qualquer mudança
			</span>
			<input
				ref={inputRef}
				type="file"
				accept=".csv,text/csv"
				className="sr-only"
				onChange={(e) => {
					const file = e.target.files?.[0];
					e.target.value = "";
					if (file) void processarArquivo(file);
				}}
			/>
		</label>
	);
}

function Numero({
	valor,
	texto,
	alerta,
}: {
	valor: number;
	texto: string;
	alerta?: boolean;
}) {
	return (
		<div className={cn("rounded-[10px] px-3.5 py-3", alerta ? "bg-danger-soft" : "bg-sidebar")}>
			<div className={cn("font-serif text-2xl tabular-nums", alerta && "text-danger-ink")}>
				{valor}
			</div>
			<div className="text-xs text-muted">{texto}</div>
		</div>
	);
}

function OpcaoModo({
	ativo,
	onSelect,
	titulo,
	children,
}: {
	ativo: boolean;
	onSelect: () => void;
	titulo: string;
	children: React.ReactNode;
}) {
	return (
		<label
			className={cn(
				"flex cursor-pointer items-start gap-2.5 rounded-[10px] px-3.5 py-3 transition-colors",
				ativo
					? "shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
					: "shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-sidebar",
			)}
		>
			<input
				type="radio"
				name="modo-importacao"
				checked={ativo}
				onChange={onSelect}
				className="mt-1 accent-accent"
			/>
			<span>
				<span className="font-medium">{titulo}</span>
				<span className="block text-[13px] text-muted">{children}</span>
			</span>
		</label>
	);
}
