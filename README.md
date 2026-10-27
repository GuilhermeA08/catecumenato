# Catecumenato

Sistema para organizar as inscrições da Crisma da Paróquia de Santana (Diocese de Santa Luzia de Mossoró): fichas de inscrição, turmas, encontros e frequência.

Os dados ficam salvos **apenas no navegador** (localStorage). Use a tela **Importar e backup** para baixar um backup `.json` com frequência.

## Funcionalidades

- Importação de planilha CSV com prévia, mesclando com os dados atuais ou substituindo
- Painel com pendências, progresso das fichas e frequência por turma
- Ficha do inscrito com campos faltantes, cobrança via WhatsApp e impressão em PDF
- Turmas com chamada por encontro, frequência por membro e distribuição por idade
- Exportação CSV e backup/restauração completos

## Desenvolvimento

```bash
bun install
bun run dev      # http://localhost:3000
bun run build
bun run test
bunx tsc --noEmit
```

Stack: Vite, React 19, TanStack Router (rotas em `src/routes`), Zustand (stores persistidos em `src/stores`), Tailwind CSS v4 (tokens em `src/styles.css`) e Radix Dialog.

Operações que envolvem mais de um store (excluir turma ou inscrito, trocar de turma, importar, apagar tudo) ficam em `src/stores/acoes.ts`. Use sempre essas funções para não deixar presenças ou encontros órfãos.
