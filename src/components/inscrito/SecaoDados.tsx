import { Card, CardContent, CardHeader } from "../ui/Card";

interface SecaoDadosProps {
	titulo: string;
	children: React.ReactNode;
	alertas?: number; // número de campos faltando
	colunas?: "estreita" | "larga";
}

/** Bloco de dados da ficha em grade de rótulo/valor */
export function SecaoDados({
	titulo,
	children,
	alertas = 0,
	colunas = "larga",
}: SecaoDadosProps) {
	return (
		<Card>
			<CardHeader
				title={titulo}
				actions={
					alertas > 0 && (
						<span className="text-xs text-warn-ink">
							{alertas} campo{alertas > 1 ? "s" : ""} faltando
						</span>
					)
				}
			/>
			<CardContent>
				<dl
					className="grid gap-x-6 gap-y-4"
					style={{
						gridTemplateColumns: `repeat(auto-fill, minmax(${colunas === "larga" ? 200 : 160}px, 1fr))`,
					}}
				>
					{children}
				</dl>
			</CardContent>
		</Card>
	);
}
