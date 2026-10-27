import { StatusPresenca } from "../../types/enums";
import { Badge, type BadgeTone } from "../ui/Badge";

export const ROTULO_PRESENCA: Record<StatusPresenca, string> = {
	[StatusPresenca.PRESENTE]: "Presente",
	[StatusPresenca.FALTA_JUSTIFICADA]: "Justificada",
	[StatusPresenca.AUSENTE]: "Falta",
	[StatusPresenca.PENDENTE]: "Sem marcação",
};

const TOM: Record<StatusPresenca, BadgeTone> = {
	[StatusPresenca.PRESENTE]: "ok",
	[StatusPresenca.FALTA_JUSTIFICADA]: "warn",
	[StatusPresenca.AUSENTE]: "danger",
	[StatusPresenca.PENDENTE]: "neutral",
};

/** Cores sólidas usadas nas tiras de frequência */
export const COR_PRESENCA: Record<StatusPresenca, string> = {
	[StatusPresenca.PRESENTE]: "var(--color-ok)",
	[StatusPresenca.FALTA_JUSTIFICADA]: "#e3b979",
	[StatusPresenca.AUSENTE]: "var(--color-danger)",
	[StatusPresenca.PENDENTE]: "var(--color-sand)",
};

export function PresencaBadge({ status }: { status: StatusPresenca }) {
	return <Badge tone={TOM[status]}>{ROTULO_PRESENCA[status]}</Badge>;
}
