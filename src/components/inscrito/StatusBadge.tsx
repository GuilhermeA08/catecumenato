import { CheckCircle, Clock } from "lucide-react";
import { Status } from "../../types/enums";
import { Badge } from "../ui/Badge";

interface StatusBadgeProps {
	status: Status;
	size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
	if (status === Status.CONCLUIDO) {
		return (
			<Badge variant="success" className={size === "sm" ? "text-xs" : ""}>
				<CheckCircle className="mr-1 h-3 w-3" />
				Concluído
			</Badge>
		);
	}

	return (
		<Badge variant="warning" className={size === "sm" ? "text-xs" : ""}>
			<Clock className="mr-1 h-3 w-3" />
			Pendente
		</Badge>
	);
}
