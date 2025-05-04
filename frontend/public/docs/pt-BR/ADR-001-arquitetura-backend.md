---
status: proposed
date: 2025-04-29
deciders: [Carlos]
consulted: []
informed: []
---

# Arquitetura Serverless do Projeto MOderated aDS: Lambda, API Gateway, DynamoDB e Cloudflare

## Contexto e Problema

O projeto **MOderated aDS** é um experimento técnico e criativo com requisitos de infraestrutura leve, baixo custo e escalabilidade. Ele envolve autenticação via e-mail, armazenamento e entrega de anúncios, moderação automatizada via IA e interface web. A preferência é por soluções serverless que permitam deploy simples, previsibilidade de custos e aproveitamento de conhecimentos prévios da equipe com AWS.

## Drivers da Decisão

- Minimização de custos operacionais
- Baixa complexidade de manutenção
- Familiaridade da equipe com o ecossistema AWS
- Facilidade de integração com ferramentas externas como Stripe e sistemas de moderação por IA
- Separação de responsabilidades: Cloudflare cuida de caching e WAF, reduzindo custos na AWS
- Escalabilidade automática e pagamento por uso

## Opções Consideradas

- **Lambda + API Gateway + DynamoDB + Cloudflare**
- **ECS Fargate + RDS + API Gateway**

## Decisão

Opção escolhida: **"Lambda + API Gateway + DynamoDB + Cloudflare"**, porque é a combinação que oferece o melhor equilíbrio entre baixo custo, flexibilidade e aproveitamento do conhecimento técnico já existente da equipe. Lambda com API Gateway permite uma arquitetura completamente serverless; DynamoDB entrega performance escalável sem necessidade de administração de instâncias; e Lambda com DynamoDB Streams processa eventos de forma desacoplada. A Cloudflare traz caching e WAF com custo reduzido.

### Consequências

- Good, porque reduz custos operacionais ao pagar apenas pelo uso
- Good, porque alavanca conhecimentos prévios da equipe em AWS
- Good, porque desacopla serviços e facilita testes independentes (eventos, moderação, autenticação)
- Good, porque escala automaticamente conforme a demanda
- Neutral, porque pode exigir otimização de cold starts em Lambda

## Validação

A implementação será validada via:

- Testes de deploy automatizado com CI/CD
- Verificação de funcionamento de fluxos principais: login via email, criação e moderação de anúncios via DynamoDB e Lambda
- Monitoramento com logs e alertas no CloudWatch
- Testes de carga para verificar escalabilidade

## Prós e Contras das Opções

### Lambda + API Gateway + DynamoDB + Cloudflare

- Good, porque tem custo baseado em uso (pay-as-you-go)
- Good, porque DynamoDB é altamente escalável e serverless
- Good, porque Lambda permite orquestração baseada em eventos sem servidores
- Good, porque Cloudflare oferece caching/WAF com custo mínimo
- Good, porque API Gateway facilita gerenciamento de APIs
- Neutral, porque pode ter latência em cold starts
- Bad, porque pode exigir otimização para cargas muito altas

### ECS Fargate + RDS + API Gateway

- Good, porque é altamente escalável e adequado para sistemas grandes
- Bad, porque aumenta complexidade de manutenção e custos fixos com RDS
- Bad, porque não atende ao objetivo de simplicidade para projeto experimental

## Informações Adicionais

A decisão será revisitada caso a escala do projeto demande maior elasticidade ou o custo operacional supere o previsto. Um plano de migração para ECS ou outras opções da AWS será avaliado nessa hipótese. A decisão será considerada válida enquanto os requisitos de baixo custo, simplicidade e escalabilidade forem atendidos.