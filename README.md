# 🚀 GitFreelas - Plataforma de Freelancing Web3

Uma plataforma descentralizada que conecta clientes e desenvolvedores através de smart contracts, integrando GitHub para gerenciamento de projetos e pagamentos em criptomoedas.

## 📋 **Visão Geral**

### **🎯 O que é o GitFreelas?**

GitFreelas é uma plataforma de freelancing que utiliza blockchain para automatizar pagamentos e contratos entre clientes e desenvolvedores. A plataforma integra com GitHub para gerenciamento de repositórios e pull requests, oferecendo transparência e segurança em todas as transações.

### **🔧 Funcionalidades Principais**

#### **Para Clientes:**

- ✅ **Criar tarefas** com descrição, valor e prazo
- ✅ **Adicionar links e anexos** (protegidos por segurança)
- ✅ **Aprovar desenvolvedores** para suas tarefas
- ✅ **Revisar pull requests** e aprovar entregas
- ✅ **Pagamentos automáticos** via smart contract

#### **Para Desenvolvedores:**

- ✅ **Aplicar para tarefas** disponíveis
- ✅ **Receber GFT tokens** como recompensa
- ✅ **Acessar repositórios** criados automaticamente
- ✅ **Submeter pull requests** para aprovação
- ✅ **Sistema de badges** para destaque

#### **Recursos da Plataforma:**

- 🔒 **Segurança de dados** - Links/anexos apenas para desenvolvedor escolhido
- 🎯 **Sistema de recompensas** - GFT tokens para desenvolvedores
- ⏰ **Controle de prazos** - Sistema de vencimento e penalidades
- 🔄 **Automação GitHub** - Criação e gerenciamento de repositórios
- 📊 **Transparência total** - Todas as transações na blockchain

## 🏗️ **Arquitetura**

### **Frontend (Next.js 15)**

- **Framework:** Next.js 15 com App Router
- **Styling:** Tailwind CSS + ShadcnUI
- **Estado:** React Hooks + Server Actions
- **Web3:** Wagmi + Ethers.js v6

### **Backend (Prisma + PostgreSQL)**

- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase)
- **Auth:** BetterAuth com GitHub
- **Storage:** Uploadthing para anexos

### **Blockchain (Solidity + Foundry)**

- **Smart Contracts:** GitFreelas + GitFreelasToken
- **Framework:** Foundry
- **Rede:** Sepolia Testnet
- **Tokens:** GFT (GitFreelas Token)

### **Integrações**

- **GitHub:** API + Webhooks para repositórios
- **MetaMask:** Conexão de carteira
- **Etherscan:** Verificação de contratos

## 🚀 **Instalação e Configuração**

### **Pré-requisitos**

```bash
# Node.js 18+
node --version

# pnpm
npm install -g pnpm

# Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### **1. Clone o Repositório**

```bash
git clone https://github.com/seu-usuario/git-freelas.git
cd git-freelas
```

### **2. Instale as Dependências**

```bash
# Frontend
pnpm install

# Smart Contracts
cd contracts
forge install
```

### **3. Configure as Variáveis de Ambiente**

#### **Frontend (.env)**

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gitfreelas"

# Auth
BETTER_AUTH_SECRET="your-secret-key"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Web3
NEXT_PUBLIC_ALCHEMY_API_KEY="your-alchemy-key"
NEXT_PUBLIC_GITFREELAS_CONTRACT_ADDRESS="0x75eB05f61dF28263453C3Bf5E01F14772e2DC288"
NEXT_PUBLIC_GFT_TOKEN_ADDRESS="0x165634C521a8A35584c20fe533f76DA3fAA6287C"

# Upload
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# GitHub
GITHUB_APP_ID="your-github-app-id"
GITHUB_PRIVATE_KEY="your-github-private-key"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"
```

#### **Smart Contracts (contracts/.env)**

```bash
# Deploy
PRIVATE_KEY="your-private-key"
ETHERSCAN_API_KEY="your-etherscan-key"
ALCHEMY_API_KEY="your-alchemy-key"
```

### **4. Configure o Banco de Dados**

```bash
# Execute as migrações
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate
```

### **5. Deploy dos Smart Contracts**

```bash
cd contracts

# Deploy na Sepolia
make deploy-sepolia

# Extrair ABIs e atualizar frontend
make extract-abi
```

### **6. Configure o GitHub App**

1. Crie um GitHub App em https://github.com/settings/apps
2. Configure as permissões necessárias
3. Instale o app na sua organização
4. Adicione as credenciais no `.env`

## 🎯 **Como Usar**

### **Para Clientes**

#### **1. Criar uma Tarefa**

1. Acesse a plataforma e conecte sua carteira
2. Vá para "Criar Tarefa"
3. Preencha:
   - **Título e descrição** da tarefa
   - **Requisitos técnicos** (opcional)
   - **Valor em ETH** para pagamento
   - **Prazo de entrega**
   - **Links e anexos** (opcional)
4. Confirme a transação no MetaMask

#### **2. Aprovar um Desenvolvedor**

1. Visualize as aplicações recebidas
2. Analise o perfil do desenvolvedor
3. Clique em "Aprovar"
4. Confirme a transação
5. Repositório será criado automaticamente

#### **3. Revisar Pull Request**

1. Desenvolvedor submete PR
2. Revise o código e arquivos
3. Aprove, rejeite ou solicite revisão
4. Pagamento é liberado automaticamente

### **Para Desenvolvedores**

#### **1. Aplicar para Tarefas**

1. Navegue pelas tarefas disponíveis
2. Clique em "Aplicar"
3. Confirme sua carteira e aceite os termos
4. Aguarde aprovação do cliente

#### **2. Trabalhar no Projeto**

1. Após aprovação, acesse o repositório criado
2. Clone e trabalhe no projeto
3. Submeta pull request quando concluir
4. Aguarde revisão do cliente

#### **3. Receber Pagamento**

1. Após aprovação do PR
2. Pagamento é liberado automaticamente
3. Receba GFT tokens como recompensa
4. Use tokens para adquirir badges

## 🔧 **Comandos Úteis**

### **Desenvolvimento**

```bash
# Frontend
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build de produção
npm run lint         # Verificar código

# Smart Contracts
cd contracts
make test            # Executar testes
make build           # Compilar contratos
make deploy-sepolia  # Deploy na testnet
make extract-abi     # Extrair ABIs
```

### **Banco de Dados**

```bash
npx prisma migrate dev    # Executar migrações
npx prisma studio        # Abrir interface do banco
npx prisma generate      # Gerar cliente
```

### **Deploy**

```bash
# Frontend
npm run build
npm run start

# Smart Contracts
cd contracts
make deploy-sepolia
make verify-sepolia CONTRACT_ADDRESS=0x...
```

## 📊 **Sistema de Tokens (GFT)**

### **GitFreelas Token (GFT)**

- **Função:** Token de recompensa da plataforma
- **Distribuição:** 100 GFT por tarefa concluída
- **Beneficiários:** Apenas desenvolvedores
- **Utilidade:** Adquirir badges de vigilância

### **Badges de Vigilância**

- **Custo:** 50 GFT tokens
- **Duração:** 72 horas
- **Benefício:** Acesso exclusivo a tarefas por 12 horas
- **Renovação:** Automática se houver tokens suficientes

## 🔒 **Segurança**

### **Proteção de Dados**

- **Links e anexos** visíveis apenas para desenvolvedor escolhido
- **Controle de acesso** baseado em status da tarefa
- **Autenticação** via GitHub + BetterAuth
- **Transações** verificadas na blockchain

### **Smart Contracts**

- **Auditados** e verificados no Etherscan
- **Pausáveis** em caso de emergência
- **Upgradeable** para correções
- **Testes** abrangentes

## 🐛 **Troubleshooting**

### **Problemas Comuns**

#### **Erro de Conexão com MetaMask**

```bash
# Verificar rede
- Certifique-se de estar na Sepolia
- Adicione a rede se necessário
- Verifique se tem ETH para gas
```

#### **Erro de Nonce**

```bash
# Reset do MetaMask
1. Abra MetaMask
2. Vá em Configurações > Avançado
3. Clique em "Reset Account"
4. Tente novamente
```

#### **Problemas com GitHub**

```bash
# Verificar configuração
1. Confirme as credenciais no .env
2. Verifique permissões do GitHub App
3. Teste a conexão da API
```

## 📈 **Roadmap**

### **Fase 1 - MVP** ✅

- [x] Sistema básico de tarefas
- [x] Integração com GitHub
- [x] Pagamentos em ETH
- [x] Sistema de tokens GFT

### **Fase 2 - Melhorias** 🚧

- [ ] Sistema de mensagens
- [ ] Notificações em tempo real
- [ ] Dashboard avançado
- [ ] Sistema de reputação

### **Fase 3 - Expansão** 📋

- [ ] Suporte a múltiplas redes
- [ ] Integração com outras plataformas
- [ ] Sistema de disputas
- [ ] Marketplace de serviços

## 🤝 **Contribuição**

### **Como Contribuir**

1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

### **Padrões de Código**

- **Frontend:** ESLint + Prettier
- **Smart Contracts:** Solhint
- **Commits:** Conventional Commits
- **Testes:** Cobertura mínima de 80%

## 📄 **Licença**

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

### **Links Úteis**

- **Plataforma:** [gitfreelas.com](https://gitfreelas.com)
- **Contratos:** [Etherscan](https://sepolia.etherscan.io/address/0x75eB05f61dF28263453C3Bf5E01F14772e2DC288)
- **GitHub:** [github.com/gitfreelas](https://github.com/gitfreelas)

---

**🚀 GitFreelas - Conectando talentos através da blockchain!**

_Desenvolvido por Lucas Almeida - Curso Legal HackBuilders_
