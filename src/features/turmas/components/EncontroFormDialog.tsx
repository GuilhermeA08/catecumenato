import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { Input, Textarea } from "../../../components/ui/Input";
import { toast } from "../../../components/ui/Toast";
import { useEncontrosStore } from "../../../stores/encontrosStore";
import type { Encontro } from "../../../types/encontro";
import { formatarDiaMes, hojeIso } from "./formatos";

interface FormEncontro {
	dataEncontro: string;
	horarioInicio: string;
	horarioFim: string;
	local: string;
	observacoes: string;
}

/** Criação (encontro ausente) ou edição de encontro */
export function EncontroFormDialog({
	open,
	onOpenChange,
	turmaId,
	encontro,
	sugestao,
	onSalvo,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	turmaId: string;
	encontro?: Encontro | null;
	/** Último encontro, usado para sugerir horário e local */
	sugestao?: Encontro | null;
	onSalvo?: (id: string) => void;
}) {
	const criarEncontro = useEncontrosStore((s) => s.criarEncontro);
	const atualizarEncontro = useEncontrosStore((s) => s.atualizarEncontro);

	const [form, setForm] = useState<FormEncontro>({
		dataEncontro: "",
		horarioInicio: "",
		horarioFim: "",
		local: "",
		observacoes: "",
	});
	const [tentouSalvar, setTentouSalvar] = useState(false);

	useEffect(() => {
		if (!open) return;
		const base = encontro ?? sugestao;
		setForm({
			dataEncontro: encontro?.dataEncontro ?? hojeIso(),
			horarioInicio: base?.horarioInicio ?? "",
			horarioFim: base?.horarioFim ?? "",
			local: base?.local ?? "",
			observacoes: encontro?.observacoes ?? "",
		});
		setTentouSalvar(false);
	}, [open, encontro, sugestao]);

	function campo<K extends keyof FormEncontro>(chave: K) {
		return {
			value: form[chave],
			onChange: (
				e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
			) => setForm((atual) => ({ ...atual, [chave]: e.target.value })),
		};
	}

	function salvar(e: FormEvent) {
		e.preventDefault();
		setTentouSalvar(true);
		if (!form.dataEncontro || !form.horarioInicio) return;

		const dados = {
			dataEncontro: form.dataEncontro,
			horarioInicio: form.horarioInicio,
			horarioFim: form.horarioFim || null,
			local: form.local.trim() || null,
			observacoes: form.observacoes.trim() || null,
		};
		if (encontro) {
			atualizarEncontro(encontro.id, dados);
			toast.sucesso("Encontro atualizado.");
			onSalvo?.(encontro.id);
		} else {
			const id = criarEncontro({ turmaId, ...dados });
			toast.sucesso(`Encontro de ${formatarDiaMes(dados.dataEncontro)} criado.`);
			onSalvo?.(id);
		}
		onOpenChange(false);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
			title={encontro ? "Editar encontro" : "Novo encontro"}
			description={
				encontro ? undefined : "Os membros atuais entram na chamada sem marcação."
			}
		>
			<form onSubmit={salvar} className="grid gap-4 sm:grid-cols-2" noValidate>
				<Input
					label="Data"
					type="date"
					required
					wrapperClassName="sm:col-span-2"
					error={tentouSalvar && !form.dataEncontro ? "Informe a data." : undefined}
					{...campo("dataEncontro")}
				/>
				<Input
					label="Início"
					type="time"
					required
					error={
						tentouSalvar && !form.horarioInicio ? "Informe o horário." : undefined
					}
					{...campo("horarioInicio")}
				/>
				<Input label="Fim (opcional)" type="time" {...campo("horarioFim")} />
				<Input
					label="Local (opcional)"
					placeholder="Sala, salão, capela…"
					wrapperClassName="sm:col-span-2"
					{...campo("local")}
				/>
				<Textarea
					label="Observações (opcional)"
					rows={3}
					wrapperClassName="sm:col-span-2"
					{...campo("observacoes")}
				/>
				<div className="-mx-6 mt-1 flex flex-wrap justify-end gap-2 border-t border-line px-6 pt-4 sm:col-span-2">
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button type="submit">
						{encontro ? "Salvar alterações" : "Criar encontro"}
					</Button>
				</div>
			</form>
		</Dialog>
	);
}
