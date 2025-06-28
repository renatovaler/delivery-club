# Sistema de Assinaturas - Frontend

Este é o frontend do Sistema de Assinaturas, desenvolvido com Next.js 14, TypeScript, e Tailwind CSS.

## 🚀 Tecnologias

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com/)

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Backend rodando localmente (porta 8000)

## 🔧 Instalação

1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd new-frontend
```

2. Instale as dependências
```bash
npm install
# ou
yarn
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```
Edite o arquivo `.env.local` com suas configurações

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
new-frontend/
├── app/                    # Rotas e páginas Next.js
├── components/            # Componentes React reutilizáveis
│   └── ui/               # Componentes de UI base
├── lib/                  # Utilitários e configurações
├── public/              # Arquivos estáticos
└── styles/             # Estilos globais e configurações
```

## 🔐 Autenticação

O sistema utiliza autenticação baseada em JWT com refresh tokens. O fluxo inclui:

- Login com email/senha
- Registro de novos usuários
- Recuperação de senha
- Refresh token automático
- Proteção de rotas

## 📱 Páginas Principais

- `/welcome` - Página inicial pública
- `/login` - Login de usuários
- `/register` - Registro de novos usuários
- `/customer-dashboard` - Dashboard principal (autenticado)
- `/forgot-password` - Recuperação de senha
- `/reset-password` - Redefinição de senha

## 🎨 Componentes UI

O projeto utiliza um conjunto de componentes base estilizados com Tailwind CSS:

- Button
- Card
- Badge
- LoadingSpinner
- Toast notifications

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar versão de produção
npm start

# Verificação de tipos
npm run type-check

# Lint
npm run lint
```

## 🔄 Estado Global

O gerenciamento de estado é feito com Zustand, principalmente para:

- Autenticação
- Notificações toast
- Cache de dados

## 🌐 Integração com API

A comunicação com o backend é feita através do Axios, com:

- Interceptors para refresh token
- Tratamento de erros global
- Tipagem TypeScript para respostas

## 📝 Convenções de Código

- Componentes em PascalCase
- Hooks começam com 'use'
- Arquivos de página em kebab-case
- Tipagem TypeScript para tudo

## 🔒 Segurança

- CSRF Protection
- HTTP-only cookies
- Headers de segurança
- Sanitização de inputs
- Rate limiting

## 🚀 Deploy

Para fazer deploy em produção:

1. Build do projeto
```bash
npm run build
```

2. Configure as variáveis de ambiente de produção

3. Inicie o servidor
```bash
npm start
```

## 📚 Documentação Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
