import { Status } from "../../types/enums";
import { Badge } from "../ui/Badge";

interface StatusBadgeProps {
	status: Status;
	/** Mostra o percentual junto (ex.: "Pendente · 42%") */
	completude?: number;
	manual?: boolean;
}

export function StatusBadge({ status, completude, manual }: StatusBadgeProps) {
	const sufixo = manual ? " (manual)" : "";
	if (status === Status.CONCLUIDO) {
		return <Badge tone="ok">Concluído{sufixo}</Badge>;
	}
	return (
		<Badge tone="warn">
			Pendente
			{completude !== undefined && ` · ${completude}%`}
			{sufixo}
		</Badge>
	);
}
