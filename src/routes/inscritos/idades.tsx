import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, User, Users } from "lucide-react";
import { useMemo } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";
import type { Inscricao } from "../../types/inscricao";
import { calcularIdade } from "../../utils/mascaras";

export const Route = createFileRoute("/inscritos/idades")({
	component: IdadesPage,
});

interface Faixa {
	label: string;
	min: number | null;
	max: number | null;
	cor: string;
	bg: string;
	borda: string;
}

const FAIXAS: Faixa[] = [
	{
		label: "Menores de 14 anos",
		min: null,
		max: 13,
		cor: "text-purple-700",
		bg: "bg-purple-50",
		borda: "border-purple-200",
	},
	{
		label: "14 – 17 anos",
		min: 14,
		max: 17,
		cor: "text-blue-700",
		bg: "bg-blue-50",
		borda: "border-blue-200",
	},
	{
		label: "18 – 24 anos",
		min: 18,
		max: 24,
		cor: "text-green-700",
		bg: "bg-green-50",
		borda: "border-green-200",
	},
	{
		label: "25 – 34 anos",
		min: 25,
		max: 34,
		cor: "text-yellow-700",
		bg: "bg-yellow-50",
		borda: "border-yellow-200",
	},
	{
		label: "35 – 49 anos",
		min: 35,
		max: 49,
		cor: "text-orange-700",
		bg: "bg-orange-50",
		borda: "border-orange-200",
	},
	{
		label: "50 anos ou mais",
		min: 50,
		max: null,
		cor: "text-red-700",
		bg: "bg-red-50",
		borda: "border-red-200",
	},
];

function pertenceFaixa(idade: number, faixa: Faixa): boolean {
	if (faixa.min !== null && idade < faixa.min) return false;
	if (faixa.max !== null && idade > faixa.max) return false;
	return true;
}

function IdadesPage() {
	const { inscricoes } = useInscricoesStore();
	const { turmas } = useTurmasStore();

	const turmaById = useMemo(() => {
		const map = new Map<string, { nome: string; cor: string }>();
		for (const t of turmas) map.set(t.id, { nome: t.nome, cor: t.cor });
		return map;
	}, [turmas]);

	const { grupos, semData } = useMemo(() => {
		const comIdade = inscricoes.map((i) => ({
			...i,
			idade: calcularIdade(i.crismando.dataNascimento),
		}));

		const semData = comIdade.filter((i) => i.idade === null);

		const grupos = FAIXAS.map((faixa) => ({
			faixa,
			inscritos: comIdade
				.filter((i) => i.idade !== null && pertenceFaixa(i.idade, faixa))
				.sort((a, b) => (a.idade as number) - (b.idade as number)),
		}));

		return { grupos, semData };
	}, [inscricoes]);

	const media = useMemo(() => {
		const comIdade = inscricoes
			.map((i) => calcularIdade(i.crismando.dataNascimento))
			.filter((i): i is number => i !== null);
		if (comIdade.length === 0) return null;
		return (comIdade.reduce((s, i) => s + i, 0) / comIdade.length).toFixed(1);
	}, [inscricoes]);

	return (
		<PageContainer
			title="Faixas Etárias"
			description={`Distribuição dos ${inscricoes.length} inscritos por idade`}
		>
			{/* Resumo */}
			<div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[
					{
						label: "Total",
						valor: inscricoes.length,
						sub: "inscritos",
						cor: "text-gray-900",
					},
					{
						label: "Com data",
						valor: inscricoes.filter(
							(i) => calcularIdade(i.crismando.dataNascimento) !== null,
						).length,
						sub: "informaram nascimento",
						cor: "text-blue-700",
					},
					{
						label: "Sem data",
						valor: semData.length,
						sub: "sem data de nascimento",
						cor: "text-red-600",
					},
					{
						label: "Média",
						valor: media ? `${media} anos` : "—",
						sub: "idade média",
						cor: "text-green-700",
					},
				].map((card) => (
					<div
						key={card.label}
						className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
					>
						<p className="text-xs font-medium text-gray-500">{card.label}</p>
						<p className={`mt-1 text-2xl font-bold ${card.cor}`}>
							{card.valor}
						</p>
						<p className="text-xs text-gray-400">{card.sub}</p>
					</div>
				))}
			</div>

			{/* Grupos por faixa */}
			<div className="flex flex-col gap-4">
				{grupos.map(({ faixa, inscritos }) => (
					<div
						key={faixa.label}
						className={`rounded-xl border ${faixa.borda} ${faixa.bg} overflow-hidden`}
					>
						{/* Cabeçalho da faixa */}
						<div className="flex items-center justify-between px-5 py-3">
							<div className="flex items-center gap-2">
								<Users className={`h-4 w-4 ${faixa.cor}`} />
								<span className={`font-semibold ${faixa.cor}`}>
									{faixa.label}
								</span>
							</div>
							<span
								className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${faixa.cor} bg-white/60`}
							>
								{inscritos.length}
							</span>
						</div>

						{/* Lista */}
						{inscritos.length > 0 ? (
							<div className="grid gap-px bg-gray-200/40 sm:grid-cols-2 lg:grid-cols-3">
								{inscritos.map((inscrito) => (
									<InscritoItem
										key={inscrito.id}
										inscrito={inscrito}
										idade={inscrito.idade as number}
										nomeTurma={inscrito.turmaId ? (turmaById.get(inscrito.turmaId) ?? null) : null}
									/>
								))}
							</div>
						) : (
							<div className="px-5 pb-4 text-sm text-gray-400">
								Nenhum inscrito nesta faixa etária.
							</div>
						)}
					</div>
				))}

				{/* Sem data de nascimento */}
				{semData.length > 0 && (
					<div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
						<div className="flex items-center justify-between px-5 py-3">
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-gray-400" />
								<span className="font-semibold text-gray-500">
									Sem data de nascimento
								</span>
							</div>
							<span className="rounded-full bg-white/60 px-2.5 py-0.5 text-sm font-bold text-gray-500">
								{semData.length}
							</span>
						</div>
						<div className="grid gap-px bg-gray-200/40 sm:grid-cols-2 lg:grid-cols-3">
							{semData.map((inscrito) => (
								<InscritoItem
									key={inscrito.id}
									inscrito={inscrito}
									idade={null}
									nomeTurma={inscrito.turmaId ? (turmaById.get(inscrito.turmaId) ?? null) : null}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</PageContainer>
	);
}

function InscritoItem({
	inscrito,
	idade,
	nomeTurma,
}: {
	inscrito: Inscricao;
	idade: number | null;
	nomeTurma: { nome: string; cor: string } | null;
}) {
	return (
		<Link
			to="/inscritos/$id"
			params={{ id: inscrito.id }}
			className="relative flex items-center justify-between gap-3 bg-white px-4 py-3 transition-colors hover:bg-gray-50"
			style={nomeTurma ? { borderLeft: `3px solid ${nomeTurma.cor}` } : { borderLeft: "3px solid transparent" }}
		>
			<div className="flex min-w-0 items-center gap-2">
				<div
					className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
					style={nomeTurma
						? { backgroundColor: nomeTurma.cor + "22", border: `1.5px solid ${nomeTurma.cor}55` }
						: { backgroundColor: "#f3f4f6" }
					}
				>
					<User
						className="h-3.5 w-3.5"
						style={{ color: nomeTurma ? nomeTurma.cor : "#6b7280" }}
					/>
				</div>
				<div className="min-w-0">
					<span className="block truncate text-sm font-medium text-gray-800">
						{inscrito.crismando.nome ?? (
							<span className="italic text-gray-400">Sem nome</span>
						)}
					</span>
					{nomeTurma ? (
						<span
							className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium mt-0.5"
							style={{ backgroundColor: nomeTurma.cor + "18", color: nomeTurma.cor }}
						>
							<GraduationCap className="h-2.5 w-2.5 shrink-0" />
							{nomeTurma.nome}
						</span>
					) : (
						<span className="flex items-center gap-1 text-xs text-gray-300 mt-0.5 italic">
							<GraduationCap className="h-2.5 w-2.5 shrink-0" />
							Sem turma
						</span>
					)}
				</div>
			</div>
			<span className="shrink-0 text-xs font-semibold text-gray-500">
				{idade !== null ? `${idade} anos` : "—"}
			</span>
		</Link>
	);
}
