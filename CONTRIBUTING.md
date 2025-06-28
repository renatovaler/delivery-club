# Guia de Contribuição

Obrigado por considerar contribuir com o Sistema de Assinaturas! Este documento fornece diretrizes e padrões para contribuir com o projeto.

## 🚀 Como Contribuir

1. Fork o projeto
2. Clone seu fork
```bash
git clone https://github.com/seu-usuario/sistema-assinaturas.git
cd sistema-assinaturas
```

3. Instale as dependências
```bash
npm install
```

4. Crie uma branch para sua feature
```bash
git checkout -b feature/nome-da-feature
```

5. Faça suas alterações seguindo as convenções do projeto

6. Commit suas mudanças
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
```

7. Push para seu fork
```bash
git push origin feature/nome-da-feature
```

8. Abra um Pull Request

## 📝 Convenções de Código

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/). Os commits devem seguir o formato:

```
tipo(escopo): descrição

[corpo]

[rodapé]
```

Tipos permitidos:
- feat: Nova funcionalidade
- fix: Correção de bug
- docs: Documentação
- style: Formatação, ponto e vírgula faltando, etc
- refactor: Refatoração de código
- test: Adicionando testes
- chore: Atualização de tarefas de build, configs, etc

### Estilo de Código

- **TypeScript**: Usamos TypeScript estrito
- **Formatação**: Prettier
- **Linting**: ESLint
- **Testes**: Jest

### Padrões de Nomenclatura

- **Arquivos**:
  - React components: PascalCase (ex: UserProfile.tsx)
  - Utilitários: camelCase (ex: formatDate.ts)
  - Testes: nome.test.ts ou nome.spec.ts

- **Variáveis e Funções**:
  - camelCase
  - Nomes descritivos
  - Evitar abreviações

- **Componentes React**:
  - PascalCase
  - Um componente por arquivo

- **Interfaces e Types**:
  - PascalCase
  - Prefixo I para interfaces (ex: IUser)
  - Sufixo Type para types (ex: UserType)

## 🧪 Testes

- Escreva testes para novas funcionalidades
- Mantenha a cobertura de testes existente
- Execute os testes antes de submeter PR:
```bash
npm test
```

## 📚 Documentação

- Atualize a documentação relevante
- Inclua comentários em código complexo
- Documente breaking changes

## 🔍 Review de Código

### Antes de Submeter um PR

1. Execute os testes
```bash
npm test
```

2. Verifique o linting
```bash
npm run lint
```

3. Formate o código
```bash
npm run format
```

4. Verifique os tipos
```bash
npm run type-check
```

### Checklist do PR

- [ ] Testes passando
- [ ] Linting ok
- [ ] Documentação atualizada
- [ ] Breaking changes documentadas
- [ ] Revisão de segurança
- [ ] Sem conflitos com main

## 🚨 Reportando Bugs

1. Verifique se o bug já foi reportado
2. Use o template de issue para bugs
3. Inclua:
   - Passos para reproduzir
   - Comportamento esperado
   - Comportamento atual
   - Screenshots se relevante
   - Ambiente (OS, Browser, etc)

## 💡 Sugerindo Melhorias

1. Verifique se a sugestão já existe
2. Use o template de issue para features
3. Descreva:
   - Problema que resolve
   - Solução proposta
   - Alternativas consideradas
   - Screenshots/mockups se relevante

## 🔒 Segurança

- Não commite credenciais
- Reporte vulnerabilidades em privado
- Siga as práticas de segurança OWASP

## 📋 Templates

### Issue Template - Bug
```markdown
**Descrição do Bug**
[Descrição clara e concisa]

**Para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Erro aparece

**Comportamento Esperado**
[Descrição clara do que deveria acontecer]

**Screenshots**
[Se aplicável]

**Ambiente:**
 - OS: [ex: Windows]
 - Browser: [ex: Chrome]
 - Versão: [ex: 22]
```

### Issue Template - Feature
```markdown
**Problema**
[Descrição do problema que a feature resolve]

**Solução Proposta**
[Descrição da solução]

**Alternativas Consideradas**
[Outras soluções consideradas]

**Contexto Adicional**
[Qualquer outro contexto]
```

### Pull Request Template
```markdown
**Descrição**
[Descrição clara das mudanças]

**Tipo de Mudança**
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

**Checklist**
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Linting passou
- [ ] Testes passaram
```

## 📅 Processo de Release

1. Merge na main apenas via PR
2. Versões seguem [Semantic Versioning](https://semver.org/)
3. Changelog mantido atualizado
4. Tags criadas para cada release

## 🤝 Código de Conduta

- Seja respeitoso
- Aceite feedback construtivo
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

## ❓ Dúvidas

Para dúvidas que não são bugs ou feature requests, use:
- Discussions no GitHub
- Canal no Discord
- Email da equipe

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).
