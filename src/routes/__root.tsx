import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "../components/layout/Header";

import "../styles.css";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<Outlet />
		</div>
	);
}
