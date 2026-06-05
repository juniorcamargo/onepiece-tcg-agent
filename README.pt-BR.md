# One Piece TCG Agent

[Read in English](README.md)

Assistente de regras baseado em RAG para o One Piece Card Game. Faça qualquer pergunta sobre regras em linguagem natural e receba respostas precisas fundamentadas no livro de regras oficial, com referências de seção.

Construído com [Mastra](https://mastra.ai), Qdrant e Claude Sonnet — seguindo os princípios de Clean Architecture / DDD.

## Como funciona

1. O PDF do livro de regras oficial é interpretado e dividido em chunks
2. Cada chunk é transformado em embedding via Google Gemini e armazenado no Qdrant
3. A cada pergunta, o agente busca os trechos de regras relevantes e responde usando o Claude Sonnet

## Pré-requisitos

- Node.js 20+
- Docker (para o Qdrant)
- [Chave de API da Anthropic](https://console.anthropic.com)
- [Chave de API do Google AI Studio](https://aistudio.google.com) — tier gratuito, usada apenas para embeddings

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha suas chaves no `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=AQ...

QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=                     # deixar vazio para instância local sem autenticação
QDRANT_COLLECTION=onepiece-tcg-rules
PDF_PATH=./docs/onepiece-tcg-rules.pdf
```

### 3. Subir o Qdrant

```bash
docker compose up -d
```

### 4. Ingerir o livro de regras

```bash
npm run ingest
```

Para limpar a coleção e reingerir do zero:

```bash
npm run ingest -- --clear
```

### 5. Iniciar o chat

```bash
npm run chat
```

```
One Piece TCG Rules Expert
Ask any rules question. Type "exit" to quit.

You: Posso atacar com um personagem no turno em que ele foi jogado?
Agent: ...
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run chat` | Inicia o assistente interativo de regras |
| `npm run ingest` | Ingere o PDF do livro de regras no Qdrant |
| `npm run ingest -- --clear` | Limpa a coleção e reingere |
| `npm run dev` | Inicia o servidor de desenvolvimento do Mastra |
| `npm test` | Executa os testes unitários |
| `npm run test:coverage` | Executa os testes com relatório de cobertura |
| `npm run build` | Verifica os tipos do projeto |

## Estrutura do projeto

```
src/
  domain/          # Entidades, value objects, ports (lógica de negócio pura)
  application/     # Casos de uso e ports de entrada/saída
  infrastructure/  # Adapters: Qdrant, parser de PDF, agente Mastra
  main/            # Entrypoints CLI (chat, ingest)
tests/
  unit/            # Testes unitários das camadas domain e application
  helpers/         # Builders de teste
```

## Arquitetura

O projeto segue Arquitetura Hexagonal (Ports & Adapters) com DDD:

- **Domain** não possui nenhuma dependência externa
- **Application** depende apenas dos ports do domain — nunca da infraestrutura
- Os adapters de **Infrastructure** são injetados via container de DI (`src/infrastructure/config/container.ts`)
- O agente Mastra vive na camada de infraestrutura e chama o caso de uso da aplicação através de uma tool
