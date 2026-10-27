import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { ConfirmHost } from "../components/ui/Dialog";
import { Toaster } from "../components/ui/Toast";

import "../styles.css";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<AppShell>
				<Outlet />
			</AppShell>
			<ConfirmHost />
			<Toaster />
		</>
	);
}
