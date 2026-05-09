import { useEncontrosStore } from "../../../stores/encontrosStore";
import { usePresencasStore } from "../../../stores/presencasStore";
import { StatusPresenca } from "../../../types/enums";
import type { Inscricao } from "../../../types/inscricao";
import type { Turma } from "../../../types/turma";
import { calcularIdade } from "../../../utils/mascaras";

export function exportarTodasTurmasPDF(
	turmas: Turma[],
	inscricoes: Inscricao[],
): void {
	const dataGeracao = new Date().toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	} as Intl.DateTimeFormatOptions);

	const turmasComMembros = turmas.map((t) => ({
		turma: t,
		membros: inscricoes
			.filter((i) => i.turmaId === t.id)
			.sort((a, b) =>
				(a.crismando.nome ?? "").localeCompare(
					b.crismando.nome ?? "",
					"pt-BR",
					{
						sensitivity: "base",
					},
				),
			),
	}));

	const totalInscritos = inscricoes.length;
	const totalNasTurmas = inscricoes.filter((i) => i.turmaId).length;
	const semTurma = totalInscritos - totalNasTurmas;

	// Summary chips
	const summaryChips = turmasComMembros
		.map(
			({ turma, membros }) => `
		<div class="summary-row">
			<span class="summary-dot" style="background:${turma.cor}"></span>
			<span class="summary-name">${escapeHtml(turma.nome)}</span>
			<span class="summary-count" style="color:${turma.cor}">${membros.length}</span>
		</div>`,
		)
		.join("");

	// Per-turma sections
	const secoes = turmasComMembros
		.map(({ turma, membros }) => {
			if (membros.length === 0) {
				return `
		<div class="turma-section">
			<div class="turma-header" style="background:linear-gradient(135deg,${turma.cor}ee 0%,${turma.cor}bb 100%)">
				<div class="turma-header-label">Turma</div>
				<h2>${escapeHtml(turma.nome)}</h2>
				${turma.descricao ? `<p class="turma-desc">${escapeHtml(turma.descricao)}</p>` : ""}
			</div>
			<p class="empty-msg">Nenhum membro nesta turma.</p>
		</div>`;
			}
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
			return `
		<div class="turma-section">
			<div class="turma-header" style="background:linear-gradient(135deg,${turma.cor}ee 0%,${turma.cor}bb 100%)">
				<div class="turma-header-label">Turma</div>
				<h2>${escapeHtml(turma.nome)}</h2>
				${turma.descricao ? `<p class="turma-desc">${escapeHtml(turma.descricao)}</p>` : ""}
				<div class="header-stats">
					<div class="stat-chip"><span class="num">${membros.length}</span> membros</div>
					<div class="stat-chip"><span class="num">${comTelefone}</span> com telefone</div>
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
					<tbody>${linhas}</tbody>
				</table>
			</div>
		</div>`;
		})
		.join("");

	const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8" />
	<title>Todas as Turmas — Catecumenato</title>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

		* { box-sizing: border-box; margin: 0; padding: 0; }

		body {
			font-family: 'Inter', Arial, sans-serif;
			font-size: 13px;
			color: #1a1a2e;
			background: #f8f9fb;
		}

		.page {
			max-width: 760px;
			margin: 0 auto;
			background: #fff;
			min-height: 100vh;
			box-shadow: 0 0 40px rgba(0,0,0,0.08);
		}

		/* ── Cover ── */
		.cover {
			background: linear-gradient(135deg, #1e3a5f 0%, #2d5f8a 100%);
			padding: 40px 40px 36px;
			color: #fff;
			position: relative;
			overflow: hidden;
		}
		.cover::before {
			content: '';
			position: absolute;
			right: -40px; top: -40px;
			width: 220px; height: 220px;
			background: rgba(255,255,255,0.06);
			border-radius: 50%;
		}
		.cover::after {
			content: '';
			position: absolute;
			right: 70px; bottom: -70px;
			width: 160px; height: 160px;
			background: rgba(255,255,255,0.04);
			border-radius: 50%;
		}
		.cover-label {
			font-size: 11px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 1.5px;
			opacity: 0.7;
			margin-bottom: 8px;
		}
		.cover h1 {
			font-size: 28px;
			font-weight: 700;
			letter-spacing: -0.5px;
			margin-bottom: 6px;
		}
		.cover-meta { font-size: 12px; opacity: 0.65; margin-top: 4px; }

		.cover-stats {
			display: flex;
			gap: 16px;
			margin-top: 24px;
			flex-wrap: wrap;
		}
		.cover-stat {
			background: rgba(255,255,255,0.15);
			border: 1px solid rgba(255,255,255,0.25);
			border-radius: 20px;
			padding: 6px 16px;
			font-size: 12px;
			font-weight: 600;
			display: flex;
			align-items: center;
			gap: 6px;
		}
		.cover-stat .num { font-size: 17px; }

		/* ── Summary table ── */
		.summary-box {
			margin: 28px 40px;
			border: 1px solid #e5e7eb;
			border-radius: 12px;
			overflow: hidden;
		}
		.summary-box-title {
			padding: 12px 16px;
			font-size: 11px;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 1px;
			color: #6b7280;
			border-bottom: 1px solid #e5e7eb;
			background: #f9fafb;
		}
		.summary-row {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px 16px;
			border-bottom: 1px solid #f3f4f6;
		}
		.summary-row:last-child { border-bottom: none; }
		.summary-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
		.summary-name { flex: 1; font-weight: 500; color: #374151; }
		.summary-count { font-size: 15px; font-weight: 700; }

		/* ── Per-turma section ── */
		.turma-section { page-break-before: always; }
		.turma-section:first-of-type { page-break-before: avoid; }

		.turma-header {
			padding: 28px 40px 24px;
			color: #fff;
			position: relative;
			overflow: hidden;
		}
		.turma-header::before {
			content: '';
			position: absolute;
			right: -30px; top: -30px;
			width: 160px; height: 160px;
			background: rgba(255,255,255,0.08);
			border-radius: 50%;
		}
		.turma-header-label {
			font-size: 10px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 1.5px;
			opacity: 0.75;
			margin-bottom: 4px;
		}
		.turma-header h2 {
			font-size: 22px;
			font-weight: 700;
			letter-spacing: -0.3px;
		}
		.turma-desc { font-size: 12px; opacity: 0.8; margin-top: 4px; }

		.header-stats { display: flex; gap: 14px; margin-top: 16px; }
		.stat-chip {
			background: rgba(255,255,255,0.2);
			border: 1px solid rgba(255,255,255,0.3);
			border-radius: 20px;
			padding: 4px 12px;
			font-size: 11px;
			font-weight: 600;
			display: flex;
			align-items: center;
			gap: 5px;
		}
		.stat-chip .num { font-size: 14px; }

		.empty-msg {
			padding: 24px 40px;
			font-size: 13px;
			color: #9ca3af;
			font-style: italic;
		}

		/* ── Table ── */
		.table-wrapper { padding: 24px 40px 32px; }
		table { width: 100%; border-collapse: separate; border-spacing: 0; }
		thead th {
			padding: 9px 12px;
			text-align: left;
			font-size: 10px;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 1px;
		}
		thead th.col-num { text-align: center; width: 48px; }
		thead th.col-idade { width: 90px; text-align: center; }
		thead th.col-tel { width: 200px; }
		td {
			padding: 10px 12px;
			border-bottom: 1px solid #eef0f4;
			vertical-align: middle;
		}
		td.num { text-align: center; color: #b0b5c3; font-size: 11px; font-weight: 600; width: 48px; }
		td.nome { font-weight: 500; color: #1a1a2e; }
		td.idade { text-align: center; color: #374151; width: 90px; }
		td.idade.sem-dado, td.tel.sem-dado { color: #c5c9d6; font-style: italic; }
		td.tel { color: #374151; font-variant-numeric: tabular-nums; }
		tbody tr.par { background: #fff; }
		tbody tr.impar { background: #f8f9fb; }
		tbody tr:last-child td { border-bottom: none; }

		/* ── Footer ── */
		.footer {
			padding: 14px 40px;
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
			.cover, .turma-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
			tbody tr.impar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
		}
	</style>
</head>
<body>
<div class="page">

	<div class="cover">
		<div class="cover-label">Relatório Geral</div>
		<h1>Todas as Turmas</h1>
		<p class="cover-meta">Catecumenato · Gerado em ${dataGeracao}</p>
		<div class="cover-stats">
			<div class="cover-stat"><span class="num">${turmas.length}</span> turmas</div>
			<div class="cover-stat"><span class="num">${totalNasTurmas}</span> inscritos em turmas</div>
			${semTurma > 0 ? `<div class="cover-stat"><span class="num">${semTurma}</span> sem turma</div>` : ""}
		</div>
	</div>

	<div class="summary-box">
		<div class="summary-box-title">Resumo por turma</div>
		${summaryChips}
	</div>

	${secoes}

	<div class="footer">
		<span>Catecumenato · <strong>Relatório Geral de Turmas</strong></span>
		<span>Gerado em ${dataGeracao}</span>
	</div>

</div>
<script>
	window.onload = function() { window.print(); };
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

export function exportarTurmaPDF(turma: Turma, membros: Inscricao[]): void {
	const dataGeracao = new Date().toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	} as Intl.DateTimeFormatOptions);

	const encontrosDaTurma = useEncontrosStore.getState().getByTurma(turma.id);
	const encontroIdsDaTurma = new Set(encontrosDaTurma.map((e) => e.id));
	const { getByInscrito } = usePresencasStore.getState();
	const totalEncontrosDaTurma = encontrosDaTurma.length;

	const comTelefone = membros.filter((m) => m.crismando.celular).length;

	const linhas = membros
		.map((m, idx) => {
			const nome = m.crismando.nome ?? "(sem nome)";
			const tel = m.crismando.celular ?? "—";
			const semTel = !m.crismando.celular;
			const idade = calcularIdade(m.crismando.dataNascimento);
			const idadeStr = idade !== null ? `${idade} anos` : "—";
			const semIdade = idade === null;

			const presencasDoMembro = getByInscrito(m.id).filter((p) =>
				encontroIdsDaTurma.has(p.encontroId),
			);
			const diasValidos = presencasDoMembro.filter(
				(p) =>
					p.status === StatusPresenca.PRESENTE ||
					p.status === StatusPresenca.FALTA_JUSTIFICADA,
			).length;
			const percentual =
				totalEncontrosDaTurma === 0
					? 0
					: Math.round((diasValidos / totalEncontrosDaTurma) * 100);
			const presencaStr =
				totalEncontrosDaTurma === 0
					? "—"
					: `${diasValidos}/${totalEncontrosDaTurma}`;
			const percentualStr =
				totalEncontrosDaTurma === 0 ? "—" : `${percentual}%`;
			return `
		<tr class="${idx % 2 === 0 ? "par" : "impar"}">
			<td class="num">${idx + 1}</td>
			<td class="nome">${escapeHtml(nome)}</td>
			<td class="presenca">${escapeHtml(presencaStr)}</td>
			<td class="percent">${escapeHtml(percentualStr)}</td>
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
		thead th.col-presenca { width: 92px; text-align: center; }
		thead th.col-percent { width: 70px; text-align: center; }
		thead th.col-idade { width: 90px; text-align: center; }
		thead th.col-tel { width: 170px; }

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
		td.presenca, td.percent {
			text-align: center;
			color: #374151;
			font-variant-numeric: tabular-nums;
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
					<th class="col-presenca">Presenças</th>
					<th class="col-percent">%</th>
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

export function exportarTurmaFichasInscricaoPDF(
	turma: Turma,
	membros: Inscricao[],
): void {
	const dataGeracao = new Date().toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	} as Intl.DateTimeFormatOptions);

	const formularios = membros
		.map((m, idx) => gerarFormularioHtml(m, turma.nome, idx + 1, membros.length))
		.join("\n<div class=\"page-break\"></div>\n");

	const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8" />
	<title>Fichas de Inscrição — ${escapeHtml(turma.nome)}</title>
	<style>
		${ESTILO_FORMS}
	</style>
</head>
<body>
	${formularios}
	<div class="footer-print">
		<p>Catecumenato · Fichas de Inscrição · ${escapeHtml(turma.nome)} · Gerado em ${dataGeracao}</p>
	</div>
<script>
	window.onload = function() { window.print(); };
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

export function exportarFichaEmBrancoPDF(): void {
	const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8" />
	<title>Ficha de Inscrição em Branco</title>
	<style>
		${ESTILO_FORMS}
	</style>
</head>
<body>
	${gerarFormularioHtml(undefined, undefined)}
	<div class="footer-print">
		<p>Catecumenato · Ficha de Inscrição em Branco</p>
	</div>
<script>
	window.onload = function() { window.print(); };
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

const ESTILO_FORMS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
	font-family: 'Inter', Arial, sans-serif;
	font-size: 13px;
	color: #1a1a2e;
	background: #f8f9fb;
}

.page-break {
	page-break-before: always;
	height: 0;
}

.pagina {
	max-width: 210mm;
	margin: 0 auto;
	background: #fff;
	min-height: 100vh;
	padding: 40px 50px;
	box-shadow: 0 0 40px rgba(0,0,0,0.08);
}

.cabecalho {
	text-align: center;
	margin-bottom: 32px;
	padding-bottom: 16px;
	border-bottom: 3px double #1a1a2e;
}
.cabecalho h1 {
	font-size: 22px;
	font-weight: 700;
	letter-spacing: 1px;
	text-transform: uppercase;
	margin-bottom: 8px;
}
.cabecalho .turma {
	font-size: 14px;
	font-weight: 500;
	color: #374151;
}
.cabecalho .aluno {
	font-size: 16px;
	font-weight: 600;
	color: #1a1a2e;
	margin-top: 4px;
}
.cabecalho .contador {
	font-size: 11px;
	color: #9ca3af;
	margin-top: 6px;
}

.secao {
	margin-bottom: 24px;
}
.secao-titulo {
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.8px;
	color: #1e3a5f;
	border-bottom: 2px solid #1e3a5f;
	padding-bottom: 4px;
	margin-bottom: 0;
}
.campo {
	display: flex;
	align-items: baseline;
	min-height: 30px;
	border-bottom: 1px solid #222;
	padding: 3px 0;
}
.rotulo {
	width: 200px;
	flex-shrink: 0;
	font-size: 11px;
	font-weight: 600;
	color: #374151;
	text-transform: uppercase;
	letter-spacing: 0.3px;
}
.valor {
	flex: 1;
	font-size: 13px;
	color: #1a1a2e;
	min-height: 1.2em;
	padding-left: 4px;
}
.valor.vazio {
	color: transparent;
	flex: 1;
	min-width: 40px;
}

.valor-checkbox {
	flex: 1;
	font-size: 13px;
	color: #1a1a2e;
	padding-left: 4px;
}
.valor-checkbox .opcao {
	display: inline-block;
	margin-right: 20px;
}
.valor-checkbox .marcado {
	font-weight: 700;
}

.rodape {
	margin-top: 40px;
	padding-top: 12px;
	border-top: 1px solid #d1d5db;
	font-size: 10px;
	color: #9ca3af;
	text-align: center;
}

.footer-print {
	text-align: center;
	padding: 8px 0;
	font-size: 10px;
	color: #9ca3af;
}

@media print {
	body { background: #fff; }
	.pagina { box-shadow: none; padding: 30px 40px; }
	.page-break { page-break-before: always; }
	.cabecalho { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

interface CampoFormDef {
	path: string;
	label: string;
}

function getSecoesFormulario(): { titulo: string; campos: CampoFormDef[] }[] {
	return [
		{
			titulo: "Dados do Crismando(a)",
			campos: [
				{ path: "crismando.nome", label: "Nome" },
				{ path: "crismando.dataNascimento", label: "Data de Nascimento" },
				{ path: "crismando.celular", label: "Celular" },
				{ path: "crismando.sexo", label: "Sexo" },
				{ path: "crismando.estadoCivil", label: "Estado Civil" },
				{ path: "crismando.naturalidade", label: "Naturalidade" },
				{ path: "crismando.endereco", label: "Endereço" },
				{ path: "crismando.bairro", label: "Bairro" },
				{ path: "crismando.municipio", label: "Município" },
				{ path: "crismando.batizado", label: "É batizado(a)?" },
				{ path: "crismando.paroquiaBatismo", label: "Paróquia do Batismo" },
				{ path: "crismando.fezPrimeiraEucaristia", label: "Fez Primeira Eucaristia?" },
				{ path: "crismando.paroquiaEucaristia", label: "Paróquia da Eucaristia" },
				{ path: "crismando.diaEncontro", label: "Dia do Encontro" },
				{ path: "crismando.horario", label: "Horário" },
			],
		},
		{
			titulo: "Dados do Pai",
			campos: [
				{ path: "pai.nome", label: "Nome" },
				{ path: "pai.estadoCivil", label: "Estado Civil" },
				{ path: "pai.naturalidade", label: "Naturalidade" },
				{ path: "pai.endereco", label: "Endereço" },
				{ path: "pai.bairro", label: "Bairro" },
				{ path: "pai.municipio", label: "Município" },
				{ path: "pai.celular", label: "Celular" },
			],
		},
		{
			titulo: "Dados da Mãe",
			campos: [
				{ path: "mae.nome", label: "Nome" },
				{ path: "mae.estadoCivil", label: "Estado Civil" },
				{ path: "mae.naturalidade", label: "Naturalidade" },
				{ path: "mae.endereco", label: "Endereço" },
				{ path: "mae.bairro", label: "Bairro" },
				{ path: "mae.municipio", label: "Município" },
				{ path: "mae.celular", label: "Celular" },
			],
		},
		{
			titulo: "Dados do Padrinho/Madrinha",
			campos: [
				{ path: "padrinho.nome", label: "Nome" },
				{ path: "padrinho.estadoCivil", label: "Estado Civil" },
				{ path: "padrinho.celular", label: "Celular" },
				{ path: "padrinho.endereco", label: "Endereço" },
				{ path: "padrinho.bairro", label: "Bairro" },
				{ path: "padrinho.municipio", label: "Município" },
			],
		},
		{
			titulo: "Controle Administrativo",
			campos: [
				{ path: "controle.catequistas", label: "Catequistas" },
				{ path: "controle.celebrante", label: "Celebrante" },
				{ path: "controle.local", label: "Local da Crisma" },
				{ path: "controle.data", label: "Data da Crisma" },
				{ path: "controle.livro", label: "Livro" },
				{ path: "controle.folha", label: "Folha" },
				{ path: "controle.numero", label: "Número" },
				{ path: "controle.inicioPreparacao", label: "Início da Preparação" },
				{ path: "controle.fimPreparacao", label: "Fim da Preparação" },
			],
		},
	];
}

function getValorPorPath(obj: Record<string, unknown>, path: string): unknown {
	return path.split(".").reduce<unknown>((acc, key) => {
		if (acc == null || typeof acc !== "object") return undefined;
		return (acc as Record<string, unknown>)[key];
	}, obj as unknown);
}

function formatarData(valor: string): string {
	const d = new Date(`${valor}T00:00:00`);
	if (!isNaN(d.getTime())) {
		return d.toLocaleDateString("pt-BR");
	}
	return valor;
}

function gerarCampoHtml(path: string, label: string, inscricao?: Inscricao): string {
	const rotulo = `<span class="rotulo">${escapeHtml(label)}</span>`;

	if (!inscricao) {
		if (path.endsWith(".batizado") || path.endsWith(".fezPrimeiraEucaristia")) {
			return `<div class="campo">${rotulo}<span class="valor-checkbox"><span class="opcao">(  ) Sim</span><span class="opcao">(  ) Não</span></span></div>`;
		}
		if (path.endsWith(".sexo")) {
			return `<div class="campo">${rotulo}<span class="valor-checkbox"><span class="opcao">(  ) M</span><span class="opcao">(  ) F</span></span></div>`;
		}
		return `<div class="campo">${rotulo}<span class="valor vazio"></span></div>`;
	}

	const val = getValorPorPath(inscricao as unknown as Record<string, unknown>, path);

	if (val === null || val === undefined || val === "") {
		if (path.endsWith(".batizado") || path.endsWith(".fezPrimeiraEucaristia")) {
			return `<div class="campo">${rotulo}<span class="valor-checkbox"><span class="opcao">(  ) Sim</span><span class="opcao">(  ) Não</span></span></div>`;
		}
		if (path.endsWith(".sexo")) {
			return `<div class="campo">${rotulo}<span class="valor-checkbox"><span class="opcao">(  ) M</span><span class="opcao">(  ) F</span></span></div>`;
		}
		return `<div class="campo">${rotulo}<span class="valor vazio"></span></div>`;
	}

	if (path.endsWith(".batizado") || path.endsWith(".fezPrimeiraEucaristia")) {
		const sim = val === true;
		return `<div class="campo">${rotulo}<span class="valor-checkbox"><span class="opcao${sim ? " marcado" : ""}">${sim ? "(X)" : "( )"} Sim</span><span class="opcao${!sim ? " marcado" : ""}">${!sim ? "(X)" : "( )"} Não</span></span></div>`;
	}

	if (path.endsWith(".sexo")) {
		const masc = val === "M" || val === "Masculino";
		const fem = val === "F" || val === "Feminino";
		return `<div class="campo">${rotulo}<span class="valor-checkbox"><span class="opcao${masc ? " marcado" : ""}">${masc ? "(X)" : "( )"} M</span><span class="opcao${fem ? " marcado" : ""}">${fem ? "(X)" : "( )"} F</span></span></div>`;
	}

	if (path.endsWith(".dataNascimento") || path.endsWith(".data") || path.endsWith(".inicioPreparacao") || path.endsWith(".fimPreparacao")) {
		const strVal = String(val);
		if (strVal.match(/^\d{4}-\d{2}-\d{2}$/)) {
			return `<div class="campo">${rotulo}<span class="valor">${escapeHtml(formatarData(strVal))}</span></div>`;
		}
	}

	return `<div class="campo">${rotulo}<span class="valor">${escapeHtml(String(val))}</span></div>`;
}

function gerarFormularioHtml(
	inscricao?: Inscricao,
	turmaNome?: string,
	indice?: number,
	total?: number,
): string {
	const secoes = getSecoesFormulario();
	const secoesHtml = secoes
		.map(
			(sec) =>
				`<div class="secao"><h2 class="secao-titulo">${escapeHtml(sec.titulo)}</h2>${sec.campos.map((c) => gerarCampoHtml(c.path, c.label, inscricao)).join("\n")}</div>`,
		)
		.join("\n");

	const nomeAluno = inscricao?.crismando.nome ?? "";
	const numero = indice && total ? ` · ${indice}/${total}` : "";

	return `
<div class="pagina">
	<div class="cabecalho">
		<h1>Ficha de Inscrição</h1>
		${turmaNome ? `<p class="turma">Turma: ${escapeHtml(turmaNome)}</p>` : ""}
		${nomeAluno ? `<p class="aluno">Aluno(a): ${escapeHtml(nomeAluno)}</p>` : ""}
		${numero ? `<p class="contador">${numero}</p>` : ""}
	</div>
	${secoesHtml}
</div>`;
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
