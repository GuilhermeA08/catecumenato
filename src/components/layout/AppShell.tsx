import * as RadixDialog from "@radix-ui/react-dialog";
import { Link, useRouterState } from "@tanstack/react-router";
import {
	Church,
	GraduationCap,
	LayoutGrid,
	Menu,
	PieChart,
	Upload,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { obterUltimoBackup } from "../../features/inscricoes/services/jsonService";
import { useInscricoesStore } from "../../stores/inscricoesStore";
import { useTurmasStore } from "../../stores/turmasStore";
import { cn } from "../../utils/cn";

interface ItemNav {
	to: string;
	label: string;
	icon: React.ReactNode;
	contagem?: number;
	exact?: boolean;
	ativo?: (pathname: string) => boolean;
}

function NavItem({ item, onNavigate }: { item: ItemNav; onNavigate?: () => void }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const ativo = item.ativo
		? item.ativo(pathname)
		: item.exact
			? pathname === item.to
			: pathname.startsWith(item.to);
	return (
		<Link
			to={item.to}
			onClick={onNavigate}
			data-ativo={ativo || undefined}
			aria-current={ativo ? "page" : undefined}
			className={cn(
				"flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-ink-2 no-underline transition-colors hover:bg-sand hover:text-ink",
				"data-ativo:bg-surface data-ativo:font-medium data-ativo:text-ink data-ativo:shadow-card",
				"[&_svg]:size-[17px] [&_svg]:shrink-0",
			)}
		>
			{item.icon}
			<span className="flex-1 truncate">{item.label}</span>
			{item.contagem !== undefined && item.contagem > 0 && (
				<span className="text-xs text-muted tabular-nums">{item.contagem}</span>
			)}
		</Link>
	);
}

function diasDesde(iso: string | null): number | null {
	if (!iso) return null;
	return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function LembreteBackup() {
	const total = useInscricoesStore((s) => s.inscricoes.length);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	// relê a cada navegação (o backup pode ter sido feito em outra tela)
	const [ultimo, setUltimo] = useState<string | null>(null);
	useEffect(() => {
		void pathname;
		setUltimo(obterUltimoBackup());
	}, [pathname]);

	if (total === 0) return null;
	const dias = diasDesde(ultimo);
	const texto =
		dias === null
			? "Nenhum backup feito ainda."
			: dias === 0
				? "Último backup hoje."
				: `Último backup há ${dias} dia${dias > 1 ? "s" : ""}.`;
	const atrasado = dias === null || dias >= 7;

	return (
		<div className="rounded-[10px] bg-surface p-3 text-xs leading-relaxed text-muted shadow-card">
			<div className="mb-0.5 flex items-center gap-1.5 font-medium text-ink">
				{atrasado && (
					<span className="size-1.5 rounded-full bg-warn" aria-hidden="true" />
				)}
				Salvo neste navegador
			</div>
			{texto}{" "}
			<Link to="/" className="text-accent hover:text-accent-hover">
				Fazer backup
			</Link>
		</div>
	);
}

function Marca() {
	return (
		<Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1 no-underline">
			<span className="flex size-[34px] items-center justify-center rounded-[10px] bg-accent text-white">
				<Church className="size-[18px]" aria-hidden="true" />
			</span>
			<span className="leading-tight">
				<span className="block font-serif text-[17px] font-medium text-ink">
					Catecumenato
				</span>
				<span className="block text-xs text-muted">Paróquia de Santana</span>
			</span>
		</Link>
	);
}

function Navegacao({ onNavigate }: { onNavigate?: () => void }) {
	const total = useInscricoesStore((s) => s.inscricoes.length);
	const totalTurmas = useTurmasStore((s) => s.turmas.length);

	const principais: ItemNav[] = [
		{ to: "/dashboard", label: "Painel", icon: <LayoutGrid /> },
		{
			to: "/inscritos",
			label: "Inscritos",
			icon: <Users />,
			contagem: total,
			ativo: (p) => p.startsWith("/inscritos") && !p.startsWith("/inscritos/idades"),
		},
		{ to: "/turmas", label: "Turmas", icon: <GraduationCap />, contagem: totalTurmas },
		{ to: "/inscritos/idades", label: "Faixas etárias", icon: <PieChart /> },
	];

	return (
		<div className="flex h-full flex-col gap-6">
			<nav aria-label="Principal" className="flex flex-col gap-0.5">
				{principais.map((item) => (
					<NavItem key={item.to} item={item} onNavigate={onNavigate} />
				))}
			</nav>
			<div className="flex flex-col gap-0.5">
				<div className="px-2.5 pb-1.5 text-xs text-muted">Dados</div>
				<NavItem
					item={{ to: "/", label: "Importar e backup", icon: <Upload />, exact: true }}
					onNavigate={onNavigate}
				/>
			</div>
			<div className="mt-auto">
				<LembreteBackup />
			</div>
		</div>
	);
}

export function AppShell({ children }: { children: React.ReactNode }) {
	const [menuAberto, setMenuAberto] = useState(false);

	return (
		<div className="min-h-screen lg:flex">
			<a
				href="#conteudo"
				className="sr-only z-50 rounded-lg bg-surface px-3 py-2 shadow-pop focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
			>
				Pular para o conteúdo
			</a>

			{/* Sidebar (desktop) */}
			<aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col gap-6 border-r border-line bg-sidebar px-3.5 py-5 lg:flex">
				<Marca />
				<Navegacao />
			</aside>

			{/* Barra superior (celular/tablet) */}
			<header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-sidebar/95 px-3 backdrop-blur lg:hidden">
				<Marca />
				<RadixDialog.Root open={menuAberto} onOpenChange={setMenuAberto}>
					<RadixDialog.Trigger asChild>
						<button
							type="button"
							className="flex size-10 items-center justify-center rounded-lg text-ink-2 hover:bg-sand"
							aria-label="Abrir menu"
						>
							<Menu className="size-5" />
						</button>
					</RadixDialog.Trigger>
					<RadixDialog.Portal>
						<RadixDialog.Overlay className="fixed inset-0 z-50 bg-ink/40 animate-fade-in" />
						<RadixDialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col gap-6 bg-sidebar px-3.5 py-4 shadow-pop animate-slide-in focus:outline-none">
							<div className="flex items-center justify-between">
								<RadixDialog.Title className="sr-only">Menu</RadixDialog.Title>
								<RadixDialog.Description className="sr-only">
									Navegação principal
								</RadixDialog.Description>
								<Marca />
								<RadixDialog.Close
									className="flex size-10 items-center justify-center rounded-lg text-ink-2 hover:bg-sand"
									aria-label="Fechar menu"
								>
									<X className="size-5" />
								</RadixDialog.Close>
							</div>
							<Navegacao onNavigate={() => setMenuAberto(false)} />
						</RadixDialog.Content>
					</RadixDialog.Portal>
				</RadixDialog.Root>
			</header>

			<main id="conteudo" className="min-w-0 flex-1">
				{children}
			</main>
		</div>
	);
}
