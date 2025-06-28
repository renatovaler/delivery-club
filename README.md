# Sistema de Assinaturas

Sistema completo de gerenciamento de assinaturas com frontend em Next.js 14 e backend em NestJS.

## 🚀 Tecnologias

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand
- Axios

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis

### Infraestrutura
- Docker & Docker Compose
- Nginx
- SSL/TLS

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 18.x ou superior
- npm ou yarn
- Make (opcional, para usar os comandos do Makefile)

## 🔧 Instalação

1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd sistema-assinaturas
```

2. Configure as variáveis de ambiente
```bash
# Frontend
cp new-frontend/.env.example new-frontend/.env.local

# Backend
cp backend/.env.example backend/.env
```

3. Instale as dependências e configure o projeto
```bash
# Se você tem Make instalado:
make install

# Sem Make:
cd new-frontend && npm install
cd ../backend && npm install
```

4. Inicie o projeto
```bash
# Com Make:
make start

# Sem Make:
docker-compose up -d
```

O sistema estará disponível em:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📦 Estrutura do Projeto

```
.
├── new-frontend/          # Frontend Next.js
│   ├── app/              # Páginas e componentes
│   ├── components/       # Componentes reutilizáveis
│   ├── lib/             # Utilitários e configurações
│   └── public/          # Arquivos estáticos
│
├── backend/             # Backend NestJS
│   ├── src/            # Código fonte
│   ├── prisma/         # Schemas e migrações
│   └── test/           # Testes
│
└── nginx/              # Configurações do Nginx
```

## 🛠️ Comandos Disponíveis

Com Make:
```bash
# Instalar dependências
make install

# Iniciar o projeto
make start

# Parar o projeto
make stop

# Reiniciar o projeto
make restart

# Ver logs
make logs

# Executar testes
make test

# Limpar ambiente
make clean

# Ver todos os comandos disponíveis
make help
```

Sem Make:
```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Logs
docker-compose logs -f
```

## 🔐 Autenticação

O sistema utiliza JWT com refresh tokens para autenticação. O fluxo inclui:

- Login com email/senha
- Registro de novos usuários
- Recuperação de senha
- Refresh token automático
- Proteção de rotas

## 📱 Funcionalidades Principais

- Gestão de assinaturas
- Dashboard do cliente
- Histórico de pagamentos
- Notificações
- Suporte ao cliente
- Relatórios e análises

## 🔒 Segurança

- HTTPS/SSL
- CSRF Protection
- Rate Limiting
- Sanitização de inputs
- Headers de segurança
- Logs de auditoria

## 📊 Monitoramento

- Logs centralizados
- Métricas de performance
- Alertas de erro
- Health checks

## 🚀 Deploy

1. Configure as variáveis de ambiente de produção
2. Execute o build
```bash
make build
```

3. Inicie os serviços
```bash
make start
```

## 🧪 Testes

```bash
# Executar todos os testes
make test

# Frontend apenas
cd new-frontend && npm test

# Backend apenas
cd backend && npm test
```

## 📝 Convenções de Código

- ESLint para linting
- Prettier para formatação
- Husky para git hooks
- Conventional Commits

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Suporte

Para suporte, envie um email para suporte@exemplo.com ou abra uma issue no GitHub.
