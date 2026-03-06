import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, X } from "lucide-react";
import { useMemo } from "react";
import { InscritoCard } from "../../components/inscrito/InscritoCard";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { useDebounce } from "../../hooks/useDebounce";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useUiStore } from "../../stores/uiStore";
import { Status } from "../../types/enums";
import { cn } from "../../utils/cn";

export const Route = createFileRoute("/inscritos/")({
	component: InscritosPage,
});

function InscritosPage() {
	const { inscricoes } = useInscricoesStore();
	const { busca, filtroStatus, setBusca, setFiltroStatus, resetFiltros } =
		useUiStore();
	const buscaDebounced = useDebounce(busca, 300);

	const filtrados = useMemo(() => {
		let resultado = [...inscricoes];

		// Filtro por status
		if (filtroStatus !== "todos") {
			resultado = resultado.filter((i) => i.status === filtroStatus);
		}

		// Busca por nome (parcial, case-insensitive)
		if (buscaDebounced.trim()) {
			const termo = buscaDebounced.toLowerCase().trim();
			resultado = resultado.filter((i) =>
				i.crismando.nome?.toLowerCase().includes(termo),
			);
		}

		return resultado;
	}, [inscricoes, filtroStatus, buscaDebounced]);

	const totalPendentes = inscricoes.filter(
		(i) => i.status === Status.PENDENTE,
	).length;
	const totalConcluidos = inscricoes.filter(
		(i) => i.status === Status.CONCLUIDO,
	).length;

	return (
		<PageContainer
			title="Inscritos"
			description={`${inscricoes.length} ${inscricoes.length !== 1 ? "inscrições" : "inscrição"} no total`}
			actions={
				<Link to="/inscritos/novo">
					<Button size="sm">
						<Plus className="h-4 w-4" />
						Novo inscrito
					</Button>
				</Link>
			}
		>
			{/* Filtros */}
			<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
				{/* Busca */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
					<input
						type="text"
						placeholder="Buscar por nome..."
						value={busca}
						onChange={(e) => setBusca(e.target.value)}
						className="w-full rounded-lg border border-gray-400 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
					/>
					{busca && (
						<button
							type="button"
							onClick={() => setBusca("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				{/* Filtro de status */}
				<div className="flex gap-2">
					{[
						{ value: "todos", label: `Todos (${inscricoes.length})` },
						{ value: Status.PENDENTE, label: `Pendentes (${totalPendentes})` },
						{
							value: Status.CONCLUIDO,
							label: `Concluídos (${totalConcluidos})`,
						},
					].map((opcao) => (
						<button
							type="button"
							key={opcao.value}
							onClick={() =>
								setFiltroStatus(opcao.value as typeof filtroStatus)
							}
							className={cn(
								"rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
								filtroStatus === opcao.value
									? "border-blue-600 bg-blue-600 text-white"
									: "border-gray-300 bg-white text-gray-600 hover:border-gray-400",
							)}
						>
							{opcao.label}
						</button>
					))}
				</div>
			</div>

			{/* Resultados */}
			{filtrados.length > 0 ? (
				<div className="flex flex-col gap-3">
					{filtrados.map((inscricao) => (
						<InscritoCard key={inscricao.id} inscricao={inscricao} />
					))}
				</div>
			) : inscricoes.length === 0 ? (
				<div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
						<Plus className="h-7 w-7 text-blue-500" />
					</div>
					<p className="mb-1 font-semibold text-gray-700">
						Nenhum inscrito ainda
					</p>
					<p className="mb-4 text-sm text-gray-500">
						Cadastre o primeiro inscrito ou importe um arquivo CSV.
					</p>
					<Link to="/inscritos/novo">
						<Button>
							<Plus className="h-4 w-4" />
							Cadastrar primeiro inscrito
						</Button>
					</Link>
				</div>
			) : (
				<div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
					<Search className="mx-auto mb-3 h-8 w-8 text-gray-300" />
					<p className="font-medium text-gray-500">
						Nenhum resultado encontrado
					</p>
					{(busca || filtroStatus !== "todos") && (
						<button
							type="button"
							onClick={resetFiltros}
							className="mt-2 text-sm text-blue-600 hover:underline"
						>
							Limpar filtros
						</button>
					)}
				</div>
			)}
		</PageContainer>
	);
}
