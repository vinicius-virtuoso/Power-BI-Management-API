# 📊 Power BI Management API

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)
![Jest](https://img.shields.io/badge/-Jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

> Solução robusta para gestão de acessos e visualização de relatórios do Power BI Embedded, com controle granular de permissões (RBAC).

----

## 🚀 Funcionalidades

- **Gestão de Usuários**: Cadastro, atualização, ativação/desativação e controle de perfis (ADMIN/USER).
- **Sincronização Automática**: Integração com a API do Power BI para importar relatórios de Workspaces dinamicamente.
- **Controle de Acessos**: Vínculo inteligente entre usuários e relatórios (`Grant/Revoke`).
- **Power BI Embedded**: Geração de `Embed Tokens` seguros e configurações de visualização (URL, DatasetId, etc).
- **Segurança**: Autenticação via JWT, senhas criptografadas e proteção de rotas por nível de acesso.

----

## 🛡️ Governança de Dados (User Lifecycle)

O sistema possui um motor de automação (`Cron Job`) para garantir a higiene e segurança dos dados, gerenciando o ciclo de vida dos usuários automaticamente:

- **Desativação Automática**: Usuários inativos há mais de **30 dias** são marcados como inativos automaticamente, perdendo acesso ao portal.
- **Exclusão de Dados**: Usuários inativos há mais de **60 dias** são removidos permanentemente do banco de dados (compliance com políticas de retenção).
- **Execução**: O Job é processado a cada 3 dias, às 03:00 da manhã, garantindo baixo impacto na performance do sistema.

---

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js v20+
* **Framework:** NestJS (TypeScript)
* **ORM:** Prisma
* **Banco de Dados:** PostgreSQL
* **Documentação:** Swagger (OpenAPI)
* **Testes:** Jest & Supertest (Unitários e E2E)

----

## 📐 Arquitetura do Sistema

O projeto utiliza os princípios de **Clean Architecture** e **Use Cases**, garantindo que a lógica de negócio seja independente de frameworks e fácil de testar.


----

## 📋 Pré-requisitos

Antes de começar, você precisará de:
* [Node.js](https://nodejs.org/) (v20 ou superior)
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* Uma conta no **Azure** com Service Principal configurado para acesso ao Power BI.

----

## ⚙️ Configuração (Variáveis de Ambiente)

Crie um arquivo `.env` na raiz do projeto e preencha conforme o exemplo:

```env
# Configurações do Banco de Dados
DATABASE_URL="postgresql://admin:admin123@localhost:5432/powerbi_db?schema=public"

# Segurança
JWT_SECRET="sua_chave_secreta_super_segura"

# Power BI / Azure Configuration
PBI_CLIENT_ID="seu-client-id-azure"
PBI_CLIENT_SECRET="seu-client-secret-azure"
PBI_TENANT_ID="seu-tenant-id-azure"
PBI_WORKSPACE_ID="id-do-seu-workspace-powerbi"
```

```bash
git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
cd seu-repositorio
```

```bash
npm install
```

```bash
docker-compose up -d
```

```bash
npx prisma migrate dev
npx prisma generate
```

```bash
npm run start:dev
```

---

## 📖 Documentação da API (Swagger)

A API possui uma documentação interativa completa. Com o servidor rodando, acesse:
👉 http://localhost:3000/api/docs

Lá você encontrará todos os endpoints, modelos de dados (DTOs) e poderá testar as requisições em tempo real.

---

## 🧪 Suíte de Testes
Para garantir a qualidade, o projeto utiliza testes automatizados:
```bash
# Testes Unitários
npm run test

# Testes E2E (End-to-End)
npm run test:e2e
```
Os testes E2E garantem o fluxo completo: desde a criação do usuário no banco até a validação do token JWT e permissões de acesso.

---

## 📂 Estrutura de Pastas
```text
src/
├── modules/
│   ├── users/        # Gestão de usuários e perfis
│   ├── reports/      # Gestão de relatórios (Power BI e Sincronização)
│   ├── user-reports/ # Lógica de vínculos N:N (Grant/Revoke)
│   └── auth/         # Autenticação e emissão de JWT
├── decorators/       # Decorators customizados para NestJS
├── lib/              # Instâncias de serviços globais (Prisma Service)
└── main.ts           # Inicialização e Swagger Config
```
---

## 📄 Licença
Não tem licença, mas use com moderação.