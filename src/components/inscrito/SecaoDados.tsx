import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "../../utils/cn";

interface SecaoDadosProps {
	titulo: string;
	defaultAberta?: boolean;
	children: React.ReactNode;
	alertas?: number; // número de campos faltando
}

export function SecaoDados({
	titulo,
	defaultAberta = true,
	children,
	alertas = 0,
}: SecaoDadosProps) {
	const [aberta, setAberta] = useState(defaultAberta);

	return (
		<div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
			<button
				type="button"
				onClick={() => setAberta((a) => !a)}
				className={cn(
					"flex w-full items-center justify-between px-5 py-4 text-left transition-colors",
					"hover:bg-gray-50 focus:outline-none",
				)}
			>
				<div className="flex items-center gap-3">
					<h3 className="font-semibold text-gray-900">{titulo}</h3>
					{alertas > 0 && (
						<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-bold text-red-700">
							{alertas}
						</span>
					)}
				</div>
				{aberta ? (
					<ChevronUp className="h-4 w-4 text-gray-400" />
				) : (
					<ChevronDown className="h-4 w-4 text-gray-400" />
				)}
			</button>
			{aberta && (
				<div className="border-t border-gray-100 px-5 py-4">{children}</div>
			)}
		</div>
	);
}
