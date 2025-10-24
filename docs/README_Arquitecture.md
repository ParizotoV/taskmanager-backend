# Arquitetura do Projeto - BACKEND

Este projeto segue os princípios da **Arquitetura Hexagonal** (_Ports & Adapters_) adaptada para um **Backend For Frontend (BFF)** com mínima lógica de domínio. Seu objetivo principal é atuar como orquestrador de chamadas externas e persistir dados necessários.

---

## 📁 Estrutura de Pastas

src/
├── application/ # Camada de orquestração e regras de coordenação
│ ├── dtos/ # DTOs de entrada e saída dos use cases
│ ├── errors.ts # Erros e exceções do domínio da aplicação
│ ├── ports/ # Contratos (interfaces) das dependências externas (ex: DAOs)
│ ├── usecases/ # Casos de uso (Application Services)
│ └── services/ # ponte entre controllers e usecases
│
├── infrastructure/ # Implementações técnicas (adapters)
│ ├── database/
│ │ ├── daos/ # Implementações dos DAOs definidos na aplicação
│ │ └── prisma/ # Setup do Prisma ORM
│ └── http/ # (futuro) Clientes HTTP para serviços externos
│
├── interfaces/ # Interfaces com o mundo externo (camada "driving")
│ └── http/
│ ├── controllers/ # Controllers HTTP
│ ├── dtos/ # DTOs específicos da interface HTTP
│ └── filters/ # Filtros e interceptadores HTTP
│
├── messaging/ # (futuro) Listeners e produtores de eventos/mensagens
│
├── shared/ # Constantes e utilitários comuns
│ └── constants/
│ └── messaging/ # Tópicos de eventos Kafka/RabbitMQ, etc.

---

## 🧩 Princípios Arquiteturais

### ✅ Hexagonal Architecture

- **Camada de aplicação** (em `src/application`) é o centro da aplicação.
- **Ports** (interfaces) definem as dependências externas.
- **Adapters** (infraestrutura) implementam esses ports.

### ✅ Independência da Infraestrutura

A camada de aplicação não deve importar nada de `infrastructure/`. Use **injeção de dependência** via NestJS para conectar implementações concretas aos contratos.

### ✅ Nomemclatura

- Use `*.usecase.ts` para casos de uso.
- Use `*.port.ts` para contratos externos.
- Use `*.dao.ts` para implementações de acesso a dados.

---

## 🧪 Testabilidade

- Casos de uso devem ser testáveis com **mocks de DAOs**.
- A camada `application/` não deve depender de Prisma ou frameworks HTTP.

---

## 🧱 Regras de Organização

| Camada           | Responsabilidade principal                                  |
|------------------|-------------------------------------------------------------|
| `application`    | Orquestrar ações e definir interfaces (ports)               |
| `infrastructure` | Implementar as interfaces usando tecnologias concretas      |
| `interfaces`     | Expor endpoints HTTP, consumir use cases                    |
| `shared`         | Utilitários e constantes reutilizáveis                      |

---

## 🧬 Convenções

- Cada use case deve **depender apenas de interfaces** (ports) e DTOs.
- Evite lógica de negócio em controllers ou DAOs.
- Use os nomes dos serviços externos nas pastas de `infrastructure/http` para clareza.

---

## 🔗 Exemplo de Conexão

```text
HTTP Controller  -->  service --> UseCase  -->  DAO (Port)  -->  Prisma (Adapter)