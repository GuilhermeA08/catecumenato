import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	fichaVazia,
	InscricaoForm,
} from "../../components/inscrito/InscricaoForm";
import { PageContainer } from "../../components/layout/PageContainer";
import { toast } from "../../components/ui/Toast";
import { useInscricoesStore } from "../../stores/inscricoesStore";

export const Route = createFileRoute("/inscritos/novo")({
	component: NovoInscritoPage,
});

function NovoInscritoPage() {
	const navigate = useNavigate();
	const adicionarInscricao = useInscricoesStore((s) => s.adicionarInscricao);
	const [inicial] = useState(fichaVazia);

	return (
		<PageContainer
			breadcrumbs={[
				{ label: "Inscritos", to: "/inscritos" },
				{ label: "Novo inscrito" },
			]}
			title="Novo inscrito"
			description="Cadastre a ficha de inscrição de um crismando."
		>
			<InscricaoForm
				inicial={inicial}
				rotuloSalvar="Salvar inscrito"
				onCancelar={() => navigate({ to: "/inscritos" })}
				onSalvar={(dados) => {
					const id = adicionarInscricao(dados);
					toast.sucesso(`Ficha de ${dados.crismando.nome} criada.`);
					navigate({ to: "/inscritos/$id", params: { id } });
				}}
			/>
		</PageContainer>
	);
}
