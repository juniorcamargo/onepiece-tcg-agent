# One Piece TCG Agent

[Ler em Português](README.pt-BR.md)

A RAG-based rules assistant for the One Piece Card Game. Ask any rules question in natural language and get precise answers backed by the official rulebook, with section references.

Built with [Mastra](https://mastra.ai), Qdrant, and Claude Sonnet — following Clean Architecture / DDD principles.

## How it works

1. The official rulebook PDF is parsed and split into chunks
2. Each chunk is embedded via Google Gemini and stored in Qdrant
3. On each question, the agent searches for relevant rule excerpts and answers using Claude Sonnet

## Prerequisites

- Node.js 20+
- Docker (for Qdrant)
- [Anthropic API key](https://console.anthropic.com)
- [Google AI Studio API key](https://aistudio.google.com) — free tier, used for embeddings only

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your keys in `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=AQ...

QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=                     # leave empty for local instance
QDRANT_COLLECTION=onepiece-tcg-rules
PDF_PATH=./docs/onepiece-tcg-rules.pdf
```

### 3. Start Qdrant

```bash
docker compose up -d
```

### 4. Ingest the rulebook

```bash
npm run ingest
```

To wipe the collection and re-ingest from scratch:

```bash
npm run ingest -- --clear
```

### 5. Start the chat

```bash
npm run chat
```

```
One Piece TCG Rules Expert
Ask any rules question. Type "exit" to quit.

You: Can I attack with a character on the turn it is played?
Agent: ...
```

## Scripts

| Command | Description |
|---|---|
| `npm run chat` | Start the interactive rules assistant |
| `npm run ingest` | Ingest the rulebook PDF into Qdrant |
| `npm run ingest -- --clear` | Clear collection and re-ingest |
| `npm run dev` | Start Mastra dev server |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run build` | Type-check the project |

## Project structure

```
src/
  domain/          # Entities, value objects, ports (pure business logic)
  application/     # Use cases and inbound/outbound ports
  infrastructure/  # Adapters: Qdrant, PDF parser, Mastra agent
  main/            # CLI entrypoints (chat, ingest)
tests/
  unit/            # Unit tests for domain and application layers
  helpers/         # Test builders
```

## Architecture

The project follows Hexagonal Architecture (Ports & Adapters) with DDD:

- **Domain** has zero external dependencies
- **Application** depends only on domain ports — never on infrastructure
- **Infrastructure** adapters are injected via the DI container (`src/infrastructure/config/container.ts`)
- The Mastra agent lives in the infrastructure layer and calls the application use case through a tool
