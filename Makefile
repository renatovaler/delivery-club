# Variáveis
DOCKER_COMPOSE = docker-compose
FRONTEND_DIR = new-frontend
BACKEND_DIR = backend

# Cores para output
GREEN = \033[0;32m
NC = \033[0m # No Color
INFO = @echo "\n${GREEN}==> ${1}${NC}"

.PHONY: help install start stop restart clean build logs test

help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Instala as dependências do projeto
	$(call INFO, "Instalando dependências do frontend...")
	cd $(FRONTEND_DIR) && npm install
	$(call INFO, "Instalando dependências do backend...")
	cd $(BACKEND_DIR) && npm install
	$(call INFO, "Gerando certificados SSL...")
	chmod +x $(FRONTEND_DIR)/nginx/ssl/generate-certs.sh
	$(FRONTEND_DIR)/nginx/ssl/generate-certs.sh

build: ## Constrói os containers Docker
	$(call INFO, "Construindo containers Docker...")
	$(DOCKER_COMPOSE) build

start: ## Inicia os containers Docker
	$(call INFO, "Iniciando containers Docker...")
	$(DOCKER_COMPOSE) up -d
	$(call INFO, "Aplicação disponível em:")
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"

stop: ## Para os containers Docker
	$(call INFO, "Parando containers Docker...")
	$(DOCKER_COMPOSE) down

restart: stop start ## Reinicia os containers Docker

clean: ## Remove containers, volumes e dependências
	$(call INFO, "Limpando o ambiente...")
	$(DOCKER_COMPOSE) down -v
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(BACKEND_DIR)/node_modules

logs: ## Mostra os logs dos containers
	$(DOCKER_COMPOSE) logs -f

test: ## Executa os testes
	$(call INFO, "Executando testes do frontend...")
	cd $(FRONTEND_DIR) && npm test
	$(call INFO, "Executando testes do backend...")
	cd $(BACKEND_DIR) && npm test

dev-frontend: ## Inicia o frontend em modo de desenvolvimento
	$(call INFO, "Iniciando frontend em modo de desenvolvimento...")
	cd $(FRONTEND_DIR) && npm run dev

dev-backend: ## Inicia o backend em modo de desenvolvimento
	$(call INFO, "Iniciando backend em modo de desenvolvimento...")
	cd $(BACKEND_DIR) && npm run start:dev

lint: ## Executa o linter
	$(call INFO, "Executando linter no frontend...")
	cd $(FRONTEND_DIR) && npm run lint
	$(call INFO, "Executando linter no backend...")
	cd $(BACKEND_DIR) && npm run lint

format: ## Formata o código
	$(call INFO, "Formatando código do frontend...")
	cd $(FRONTEND_DIR) && npm run format
	$(call INFO, "Formatando código do backend...")
	cd $(BACKEND_DIR) && npm run format

db-migrate: ## Executa as migrações do banco de dados
	$(call INFO, "Executando migrações do banco de dados...")
	cd $(BACKEND_DIR) && npx prisma migrate deploy

db-seed: ## Popula o banco de dados com dados iniciais
	$(call INFO, "Populando banco de dados...")
	cd $(BACKEND_DIR) && npx prisma db seed

generate-types: ## Gera os tipos TypeScript
	$(call INFO, "Gerando tipos do frontend...")
	cd $(FRONTEND_DIR) && npm run generate:types
	$(call INFO, "Gerando tipos do backend...")
	cd $(BACKEND_DIR) && npm run generate:types

# Comando padrão
.DEFAULT_GOAL := help
