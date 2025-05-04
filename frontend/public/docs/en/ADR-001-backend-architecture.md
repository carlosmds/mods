---
status: proposed
date: 2025-04-29
deciders: [Carlos]
consulted: []
informed: []
---

# Serverless Architecture for MOderated aDS Project: Lambda, API Gateway, DynamoDB, and Cloudflare

## Context and Problem Statement

The **MOderated aDS** project is a technical and creative experiment with requirements for lightweight infrastructure, low cost, and scalability. It involves email authentication, ad storage and delivery, automated AI moderation, and web interface. The preference is for serverless solutions that allow simple deployment, predictable costs, and leverage the team's previous knowledge of AWS.

## Decision Drivers

- Minimization of operational costs
- Low maintenance complexity
- Team's familiarity with AWS ecosystem
- Ease of integration with external tools like Stripe and AI moderation systems
- Separation of responsibilities: Cloudflare handles caching and WAF, reducing AWS costs
- Automatic scalability and pay-per-use model

## Considered Options

- **Lambda + API Gateway + DynamoDB + Cloudflare**
- **ECS Fargate + RDS + API Gateway**

## Decision

Chosen option: **"Lambda + API Gateway + DynamoDB + Cloudflare"**, because it offers the best balance between low cost, flexibility, and leveraging the team's existing technical knowledge. Lambda with API Gateway enables a completely serverless architecture; DynamoDB delivers scalable performance without instance management; and Lambda with DynamoDB Streams processes events in a decoupled manner. Cloudflare provides caching and WAF at reduced cost.

### Consequences

- Good, because it reduces operational costs by paying only for usage
- Good, because it leverages the team's previous AWS knowledge
- Good, because it decouples services and facilitates independent testing (events, moderation, authentication)
- Good, because it scales automatically with demand
- Neutral, because it may require cold start optimization in Lambda

## Validation

The implementation will be validated through:

- Automated deployment tests with CI/CD
- Verification of main flows: email login, ad creation and moderation via DynamoDB and Lambda
- Monitoring with logs and alerts in CloudWatch
- Load testing to verify scalability

## Pros and Cons of the Options

### Lambda + API Gateway + DynamoDB + Cloudflare

- Good, because it has usage-based cost (pay-as-you-go)
- Good, because DynamoDB is highly scalable and serverless
- Good, because Lambda enables event-based orchestration without servers
- Good, because Cloudflare provides caching/WAF at minimal cost
- Good, because API Gateway facilitates API management
- Neutral, because it may have latency in cold starts
- Bad, because it may require optimization for very high loads

### ECS Fargate + RDS + API Gateway

- Good, because it's highly scalable and suitable for large systems
- Bad, because it increases maintenance complexity and fixed costs with RDS
- Bad, because it doesn't meet the simplicity objective for an experimental project

## More Information

The decision will be revisited if the project's scale demands greater elasticity or if operational costs exceed expectations. A migration plan to ECS or other AWS options will be evaluated in that case. The decision will be considered valid as long as the requirements for low cost, simplicity, and scalability are met. 