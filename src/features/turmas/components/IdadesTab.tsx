import { Cake } from "lucide-react";
import { useMemo } from "react";
import { Card, CardHeader } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/misc";
import type { Inscricao } from "../../../types/inscricao";
import { calcularIdade } from "../../../utils/mascaras";
import { plural } from "./formatos";

const FAIXAS = [
	{ label: "Menos de 14", min: 0, max: 13 },
	{ label: "14 – 17 anos", min: 14, max: 17 },
	{ label: "18 – 24 anos", min: 18, max: 24 },
	{ label: "25 – 35 anos", min: 25, max: 35 },
	{ label: "36 – 50 anos", min: 36, max: 50 },
	{ label: "Acima de 50", min: 51, max: 999 },
];

export function IdadesTab({ membros, cor }: { membros: Inscricao[]; cor: string }) {
	const { faixas, semIdade, media } = useMemo(() => {
		const idades = membros
			.map((m) => calcularIdade(m.crismando.dataNascimento))
			.filter((i): i is number => i !== null);
		return {
			faixas: FAIXAS.map((f) => ({
				...f,
				count: idades.filter((i) => i >= f.min && i <= f.max).length,
			})),
			semIdade: membros.length - idades.length,
			media: idades.length
				? Math.round(idades.reduce((s, i) => s + i, 0) / idades.length)
				: null,
		};
	}, [membros]);

	const comIdade = membros.length - semIdade;

	if (membros.length === 0) {
		return (
			<Card>
				<EmptyState icon={<Cake />} title="Sem membros">
					Adicione membros à turma para ver a distribuição por idade.
				</EmptyState>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader
				title="Distribuição por idade"
				description={[
					media !== null ? `Idade média: ${media} anos` : null,
					semIdade > 0
						? `${plural(semIdade, "membro", "membros")} sem data de nascimento`
						: null,
				]
					.filter(Boolean)
					.join(" · ")}
			/>
			<ul className="m-0 flex list-none flex-col gap-4 px-5 pb-6 sm:px-6">
				{faixas.map((f) => {
					const pct = comIdade > 0 ? (f.count / comIdade) * 100 : 0;
					return (
						<li key={f.label}>
							<div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
								<span className="text-ink-2">{f.label}</span>
								<span className="tabular-nums">
									<span className="font-medium">{f.count}</span>
									{f.count > 0 && (
										<span className="ml-1.5 text-xs text-muted">
											{Math.round(pct)}%
										</span>
									)}
								</span>
							</div>
							<div
								className="h-2 overflow-hidden rounded-full bg-sand"
								role="progressbar"
								aria-label={f.label}
								aria-valuenow={Math.round(pct)}
								aria-valuemin={0}
								aria-valuemax={100}
							>
								<div
									className="h-full rounded-full transition-[width] duration-500"
									style={{ width: `${pct}%`, backgroundColor: cor }}
								/>
							</div>
						</li>
					);
				})}
			</ul>
		</Card>
	);
}
