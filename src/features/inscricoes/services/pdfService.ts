import type { Inscricao } from "../../../types/inscricao";
import type { Turma } from "../../../types/turma";
import { calcularIdade } from "../../../utils/mascaras";

export function exportarTurmaPDF(turma: Turma, membros: Inscricao[]): void {
	const dataGeracao = new Date().toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	} as Intl.DateTimeFormatOptions);

	const comTelefone = membros.filter((m) => m.crismando.celular).length;

	const linhas = membros
		.map((m, idx) => {
			const nome = m.crismando.nome ?? "(sem nome)";
			const tel = m.crismando.celular ?? "—";
			const semTel = !m.crismando.celular;
			const idade = calcularIdade(m.crismando.dataNascimento);
			const idadeStr = idade !== null ? `${idade} anos` : "—";
			const semIdade = idade === null;
			return `
		<tr class="${idx % 2 === 0 ? "par" : "impar"}">
			<td class="num">${idx + 1}</td>
			<td class="nome">${escapeHtml(nome)}</td>
			<td class="idade ${semIdade ? "sem-dado" : ""}">${escapeHtml(idadeStr)}</td>
			<td class="tel ${semTel ? "sem-dado" : ""}">${escapeHtml(tel)}</td>
		</tr>`;
		})
		.join("");

	const corHex = turma.cor;

	const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Lista — ${escapeHtml(turma.nome)}</title>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

		* { box-sizing: border-box; margin: 0; padding: 0; }

		body {
			font-family: 'Inter', Arial, sans-serif;
			font-size: 13px;
			color: #1a1a2e;
			background: #f8f9fb;
			padding: 0;
		}

		.page {
			max-width: 760px;
			margin: 0 auto;
			background: #fff;
			min-height: 100vh;
			box-shadow: 0 0 40px rgba(0,0,0,0.08);
		}

		/* ── Cabeçalho ── */
		.header {
			background: linear-gradient(135deg, ${corHex}ee 0%, ${corHex}bb 100%);
			padding: 32px 40px 28px;
			color: #fff;
			position: relative;
			overflow: hidden;
		}
		.header::before {
			content: '';
			position: absolute;
			right: -40px;
			top: -40px;
			width: 200px;
			height: 200px;
			background: rgba(255,255,255,0.08);
			border-radius: 50%;
		}
		.header::after {
			content: '';
			position: absolute;
			right: 60px;
			bottom: -60px;
			width: 140px;
			height: 140px;
			background: rgba(255,255,255,0.06);
			border-radius: 50%;
		}
		.header-label {
			font-size: 11px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 1.5px;
			opacity: 0.75;
			margin-bottom: 6px;
		}
		.header h1 {
			font-size: 26px;
			font-weight: 700;
			letter-spacing: -0.5px;
			margin-bottom: 4px;
		}
		.header .desc {
			font-size: 13px;
			opacity: 0.8;
			margin-top: 4px;
		}
		.header-stats {
			display: flex;
			gap: 20px;
			margin-top: 20px;
		}
		.stat-chip {
			background: rgba(255,255,255,0.2);
			border: 1px solid rgba(255,255,255,0.3);
			border-radius: 20px;
			padding: 5px 14px;
			font-size: 12px;
			font-weight: 600;
			display: flex;
			align-items: center;
			gap: 6px;
		}
		.stat-chip .num { font-size: 16px; }

		/* ── Tabela ── */
		.table-wrapper {
			padding: 32px 40px 40px;
		}
		table {
			width: 100%;
			border-collapse: separate;
			border-spacing: 0;
		}
		thead tr {
			border-bottom: 2px solid ${corHex}55;
		}
		thead th {
			padding: 10px 12px;
			text-align: left;
			font-size: 10px;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 1px;
			color: ${corHex};
			background: ${corHex}0d;
		}
		thead th.col-num { text-align: center; width: 48px; }
		thead th.col-idade { width: 90px; text-align: center; }
		thead th.col-tel { width: 200px; }

		tbody tr {
			transition: background 0.1s;
		}
		tbody tr.par { background: #fff; }
		tbody tr.impar { background: #f8f9fb; }
		tbody tr:last-child td {
			border-bottom: none;
		}
		td {
			padding: 11px 12px;
			border-bottom: 1px solid #eef0f4;
			vertical-align: middle;
		}

		td.num {
			text-align: center;
			color: #b0b5c3;
			font-size: 11px;
			font-weight: 600;
			width: 48px;
		}
		td.nome {
			font-weight: 500;
			color: #1a1a2e;
		}
		td.idade {
			text-align: center;
			color: #374151;
			width: 90px;
		}
		td.idade.sem-dado {
			color: #c5c9d6;
			font-style: italic;
		}
		td.tel {
			color: #374151;
			font-variant-numeric: tabular-nums;
		}
		td.tel.sem-dado {
			color: #c5c9d6;
			font-style: italic;
		}

		/* ── Rodapé ── */
		.footer {
			padding: 16px 40px;
			border-top: 1px solid #eef0f4;
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 10px;
			color: #a0a5b5;
		}
		.footer strong { color: #6b7280; }

		/* ── Print ── */
		@media print {
			body { background: #fff; }
			.page { box-shadow: none; }
			.header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
			thead th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
			tbody tr.impar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
		}
	</style>
</head>
<body>
<div class="page">

	<div class="header">
		<div class="header-label">Lista de Membros</div>
		<h1>${escapeHtml(turma.nome)}</h1>
		${turma.descricao ? `<p class="desc">${escapeHtml(turma.descricao)}</p>` : ""}
		<div class="header-stats">
			<div class="stat-chip">
				<span class="num">${membros.length}</span> membros
			</div>
			<div class="stat-chip">
				<span class="num">${comTelefone}</span> com telefone
			</div>
		</div>
	</div>

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th class="col-num">#</th>
					<th>Nome</th>
					<th class="col-idade">Idade</th>
					<th class="col-tel">Telefone / Celular</th>
				</tr>
			</thead>
			<tbody>
				${linhas}
			</tbody>
		</table>
	</div>

	<div class="footer">
		<span>Catecumenato · Turma <strong>${escapeHtml(turma.nome)}</strong></span>
		<span>Gerado em ${dataGeracao}</span>
	</div>

</div>
<script>
	window.onload = function() {
		window.print();
	};
</script>
</body>
</html>`;

	const janela = window.open("", "_blank");
	if (!janela) {
		alert(
			"Não foi possível abrir a janela de impressão. Verifique se pop-ups estão permitidos.",
		);
		return;
	}
	janela.document.write(html);
	janela.document.close();
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
