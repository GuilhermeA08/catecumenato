import type { Inscricao } from "../../../types/inscricao";
import type { Turma } from "../../../types/turma";

export function exportarTurmaPDF(turma: Turma, membros: Inscricao[]): void {
	const comNome = membros.filter((m) => m.crismando.nome);
	const comTelefone = membros.filter((m) => m.crismando.celular);

	const linhas = membros
		.map((m, idx) => {
			const nome = m.crismando.nome ?? "(sem nome)";
			const tel = m.crismando.celular ?? "—";
			return `
			<tr>
				<td class="num">${idx + 1}</td>
				<td class="nome">${nome}</td>
				<td class="tel">${tel}</td>
			</tr>`;
		})
		.join("");

	const html = `<!DOCTYPE html>
<html lang="pt-br">
<head>
	<meta charset="UTF-8" />
	<title>${turma.nome}</title>
	<style>
		* { box-sizing: border-box; margin: 0; padding: 0; }
		body {
			font-family: Arial, sans-serif;
			font-size: 12px;
			color: #111;
			padding: 24px 32px;
		}
		h1 {
			font-size: 18px;
			margin-bottom: 4px;
			color: ${turma.cor};
		}
		.desc {
			font-size: 12px;
			color: #555;
			margin-bottom: 12px;
		}
		.resumo {
			display: flex;
			gap: 24px;
			margin-bottom: 16px;
			font-size: 12px;
		}
		.resumo span {
			background: #f3f4f6;
			border-radius: 6px;
			padding: 4px 10px;
		}
		.resumo strong { font-weight: 700; }
		table {
			width: 100%;
			border-collapse: collapse;
		}
		thead th {
			background: ${turma.cor}22;
			border-bottom: 2px solid ${turma.cor}66;
			padding: 6px 8px;
			text-align: left;
			font-size: 11px;
			text-transform: uppercase;
			color: #444;
		}
		tbody tr:nth-child(even) { background: #f9fafb; }
		tbody tr:hover { background: #f1f5f9; }
		td {
			padding: 5px 8px;
			border-bottom: 1px solid #e5e7eb;
			vertical-align: top;
		}
		.num { width: 36px; color: #888; text-align: right; }
		.nome { font-weight: 500; }
		.tel { color: #374151; }
		.rodape {
			margin-top: 20px;
			font-size: 10px;
			color: #aaa;
			text-align: right;
		}
		@media print {
			body { padding: 12px; }
		}
	</style>
</head>
<body>
	<h1>${turma.nome}</h1>
	${turma.descricao ? `<p class="desc">${turma.descricao}</p>` : ""}
	<div class="resumo">
		<span><strong>${membros.length}</strong> membros</span>
		<span><strong>${comNome.length}</strong> com nome</span>
		<span><strong>${comTelefone.length}</strong> com telefone</span>
	</div>
	<table>
		<thead>
			<tr>
				<th class="num">#</th>
				<th class="nome">Nome</th>
				<th class="tel">Telefone</th>
			</tr>
		</thead>
		<tbody>
			${linhas}
		</tbody>
	</table>
	<p class="rodape">Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
	<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

	const janela = window.open("", "_blank");
	if (!janela) return;
	janela.document.write(html);
	janela.document.close();
}
