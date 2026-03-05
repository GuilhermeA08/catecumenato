import { Link } from "@tanstack/react-router";
import {
	Church,
	Download,
	GraduationCap,
	LayoutDashboard,
	PieChart,
	Trash2,
	Upload,
	Users,
} from "lucide-react";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { Button } from "../ui/Button";

interface NavLinkProps {
	to: string;
	icon: React.ReactNode;
	label: string;
}

function NavLink({ to, icon, label }: NavLinkProps) {
	return (
		<Link
			to={to}
			className="[&.active]:text-blue-400 [&.active]:font-semibold flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white sm:px-3"
			activeOptions={{ exact: to === "/" }}
		>
			{icon}
			<span className="hidden sm:inline">{label}</span>
		</Link>
	);
}

export function Header() {
	const { carregado, getTotais, exportar, limpar } = useInscricoesStore();
	const totais = getTotais();

	function handleLimpar() {
		if (
			confirm(
				"Deseja remover todos os dados da memória? Esta ação não pode ser desfeita.",
			)
		) {
			limpar();
		}
	}

	return (
		<header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
				{/* Logo */}
				<Link to="/" className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
						<Church className="h-4 w-4 text-white" />
					</div>
					<div className="hidden sm:block">
						<p className="text-sm font-bold leading-none text-white">
							Catecumenato
						</p>
						<p className="text-xs text-gray-400">Paróquia de Santana</p>
					</div>
				</Link>

				{/* Nav */}
				<nav className="flex items-center gap-1">
					<NavLink
						to="/"
						icon={<Upload className="h-4 w-4" />}
						label="Importar"
					/>
					<NavLink
						to="/dashboard"
						icon={<LayoutDashboard className="h-4 w-4" />}
						label="Dashboard"
					/>
					<NavLink
						to="/inscritos"
						icon={<Users className="h-4 w-4" />}
						label={`Inscritos${totais.total > 0 ? ` (${totais.total})` : ""}`}
					/>
					<NavLink
						to="/inscritos/idades"
						icon={<PieChart className="h-4 w-4" />}
						label="Idades"
					/>
					<NavLink
						to="/turmas"
						icon={<GraduationCap className="h-4 w-4" />}
						label="Turmas"
					/>
				</nav>

				{/* Actions */}
				{carregado && (
					<div className="flex items-center gap-2">
						<Button
							variant="secondary"
							size="sm"
							onClick={exportar}
							title="Exportar CSV"
						>
							<Download className="h-4 w-4" />
							<span className="hidden sm:inline">Exportar</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleLimpar}
							title="Limpar dados"
							className="text-red-500 hover:text-red-600"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>
		</header>
	);
}
