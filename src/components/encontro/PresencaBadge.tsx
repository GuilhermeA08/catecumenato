import { CheckCircle2, Clock3, OctagonX, ShieldCheck } from "lucide-react";
import { StatusPresenca } from "../../types/enums";
import { Badge } from "../ui/Badge";

interface PresencaBadgeProps {
	status: StatusPresenca;
	size?: "sm" | "md";
}

export function PresencaBadge({ status, size = "md" }: PresencaBadgeProps) {
	const classes = size === "sm" ? "text-xs" : "";

	if (status === StatusPresenca.PRESENTE) {
		return (
			<Badge variant="success" className={classes}>
				<CheckCircle2 className="mr-1 h-3 w-3" />
				Presente
			</Badge>
		);
	}

	if (status === StatusPresenca.FALTA_JUSTIFICADA) {
		return (
			<Badge variant="default" className={classes}>
				<ShieldCheck className="mr-1 h-3 w-3" />
				Justificada
			</Badge>
		);
	}

	if (status === StatusPresenca.AUSENTE) {
		return (
			<Badge variant="danger" className={classes}>
				<OctagonX className="mr-1 h-3 w-3" />
				Ausente
			</Badge>
		);
	}

	return (
		<Badge variant="warning" className={classes}>
			<Clock3 className="mr-1 h-3 w-3" />
			Pendente
		</Badge>
	);
}
