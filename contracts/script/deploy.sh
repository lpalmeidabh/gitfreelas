#!/bin/bash
# scripts/deploy.sh

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[GitFreelas]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Verificar argumentos
NETWORK=${1:-sepolia}
VERIFY=${2:-true}

log "🚀 Iniciando deploy na rede: $NETWORK"

# Verificar se estamos no diretório correto
if [ ! -f "foundry.toml" ]; then
    error "foundry.toml não encontrado! Execute este script do diretório contracts/"
fi

# Verificar se .env existe
if [ ! -f .env ]; then
    error "Arquivo .env não encontrado! Copie de .env.example e configure"
fi

# Carregar variáveis de ambiente
source .env

# Verificar variáveis obrigatórias
if [ -z "$PRIVATE_KEY" ]; then
    error "PRIVATE_KEY não configurada no .env"
fi

if [ -z "$CONTRACT_OWNER" ]; then
    error "CONTRACT_OWNER não configurada no .env"
fi

if [ "$VERIFY" = "true" ] && [ -z "$ETHERSCAN_API_KEY" ]; then
    warn "ETHERSCAN_API_KEY não configurada - verificação será pulada"
    VERIFY="false"
fi

# Verificar se a rede é válida
case $NETWORK in
    "localhost"|"anvil")
        RPC_URL="http://127.0.0.1:8545"
        PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # Anvil default
        ;;
    "sepolia")
        if [ -z "$ALCHEMY_API_KEY" ]; then
            error "ALCHEMY_API_KEY não configurada para Sepolia"
        fi
        RPC_URL="https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY"
        ;;
    "mainnet")
        warn "⚠️  DEPLOY EM MAINNET! Esta é a rede principal com ETH real!"
        if [ -z "$ALCHEMY_API_KEY" ]; then
            error "ALCHEMY_API_KEY não configurada para Mainnet"
        fi
        RPC_URL="https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY"

        # Confirmação extra para mainnet
        echo -e "${RED}ATENÇÃO: Deploy em MAINNET!${NC}"
        read -p "Digite 'DEPLOY_MAINNET_CONFIRMED' para continuar: " confirm
        if [ "$confirm" != "DEPLOY_MAINNET_CONFIRMED" ]; then
            error "Deploy cancelado"
        fi
        ;;
    *)
        error "Rede não suportada: $NETWORK (use: localhost, sepolia, mainnet)"
        ;;
esac

# Criar diretório de deployments se não existir
mkdir -p deployments

# Backup de deploys anteriores
if [ -f "deployments/$NETWORK.json" ]; then
    cp "deployments/$NETWORK.json" "deployments/$NETWORK.backup.$(date +%s).json"
    log "📦 Backup criado do deploy anterior"
fi

log "📋 Configurações do deploy:"
log "   Rede: $NETWORK"
log "   RPC: $RPC_URL"
log "   Owner: $CONTRACT_OWNER"
log "   Verificação: $VERIFY"

# Construir comando do forge
FORGE_CMD="forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --slow"

if [ "$VERIFY" = "true" ]; then
    FORGE_CMD="$FORGE_CMD --verify --etherscan-api-key $ETHERSCAN_API_KEY"
fi

# Executar deploy
log "📦 Executando deploy..."
eval $FORGE_CMD

if [ $? -eq 0 ]; then
    log "✅ Deploy concluído com sucesso!"

    # Mostrar informações úteis
    log "📋 Informações do deploy:"
    log "   📁 Logs: broadcasts/Deploy.s.sol/$NETWORK/"
    log "   📄 Config: deployments/$NETWORK.json"

    if [ "$VERIFY" = "true" ]; then
        log "   🔍 Contrato verificado no Etherscan"
    fi

    # Sugestões próximos passos
    log ""
    log "🎯 Próximos passos:"
    log "   1. Verificar o contrato no Etherscan"
    log "   2. Atualizar endereço no frontend (src/lib/web3/config.ts)"
    log "   3. Testar as funções do contrato"

else
    error "❌ Deploy falhou! Verifique os logs acima"
fi