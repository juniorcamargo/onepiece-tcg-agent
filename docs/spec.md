Você é um engenheiro sênior trabalhando neste projeto.

## Contexto

Estamos construindo um agente especialista nas regras do One Piece TCG, 
alimentado por RAG sobre um PDF oficial de regras localizado em 
./docs/onepiece-tcg-rules.pdf

## Stack instalada

- @mastra/core — orquestração do agente
- @mastra/rag — pipeline RAG
- @mastra/vector-qdrant — integração com Qdrant
- @ai-sdk/anthropic — LLM Claude
- zod@^4 — validação de schemas
- pdf-parse — extração de texto do PDF
- typescript strict mode

## Arquitetura

O projeto deve seguir DDD + Clean Architecture com ports and adapters.
Antes de começar a implementação, proponha a estrutura de pastas que 
você considera mais adequada para este projeto, justificando onde cada 
conceito (entidades, value objects, repositórios, use cases, serviços, 
adapters, e a camada do Mastra) deve ficar e por quê.

Aguarde minha aprovação da estrutura antes de escrever qualquer código.

## Restrições inegociáveis

- Sem any, sem type assertions desnecessárias
- Dependências só fluem para dentro — nunca infraestrutura vazando para domínio
- Toda validação de input/output usa Zod

## Plano de execução

Após aprovação da estrutura, execute uma etapa por vez aguardando 
confirmação antes de avançar:

1. tsconfig.json com path aliases + .env.example + docker-compose.yml
2. Camada de domínio
3. Camada de infraestrutura
4. Camada do Mastra
5. Scripts de ingestão e chat
6. Testes unitários com Vitest

Comece propondo a estrutura de pastas.