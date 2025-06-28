module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Documentação
        'style',    // Mudanças que não afetam o significado do código
        'refactor', // Refatoração de código
        'perf',     // Melhorias de performance
        'test',     // Adicionando ou modificando testes
        'chore',    // Mudanças no processo de build ou ferramentas auxiliares
        'ci',       // Mudanças nos arquivos de CI
        'revert',   // Reverter commits
        'build',    // Mudanças que afetam o sistema de build
        'security', // Correções de segurança
      ],
    ],
    'type-case': [2, 'always', 'lower'],
    'type-empty': [2, 'never'],
    'subject-case': [
      2,
      'always',
      ['sentence-case', 'lower-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
  prompt: {
    questions: {
      type: {
        description: 'Selecione o tipo de alteração que você está fazendo:',
        enum: {
          feat: {
            description: 'Uma nova funcionalidade',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'Uma correção de bug',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Apenas documentação',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: 'Mudanças que não afetam o significado do código',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: 'Uma mudança de código que não corrige um bug nem adiciona uma funcionalidade',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'Uma mudança de código que melhora a performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'Adicionando testes ausentes ou corrigindo testes existentes',
            title: 'Tests',
            emoji: '🚨',
          },
          chore: {
            description: 'Outras mudanças que não modificam os arquivos src ou de teste',
            title: 'Chores',
            emoji: '♻️',
          },
          ci: {
            description: 'Mudanças em nossos arquivos e scripts de configuração de CI',
            title: 'Continuous Integration',
            emoji: '⚙️',
          },
          security: {
            description: 'Correções de vulnerabilidades de segurança',
            title: 'Security',
            emoji: '🔒',
          },
        },
      },
      scope: {
        description: 'Qual é o escopo desta alteração (ex.: componente ou nome do arquivo)',
      },
      subject: {
        description: 'Escreva uma descrição curta e imperativa da mudança',
      },
      body: {
        description: 'Forneça uma descrição mais detalhada da mudança',
      },
      isBreaking: {
        description: 'Há mudanças que quebram a compatibilidade?',
      },
      breakingBody: {
        description: 'Um commit que quebra a compatibilidade requer um corpo. Forneça uma descrição mais longa',
      },
      breaking: {
        description: 'Descreva as mudanças que quebram a compatibilidade',
      },
      isIssueAffected: {
        description: 'Esta mudança afeta alguma issue?',
      },
      issuesBody: {
        description: 'Se issues foram afetadas, adicione uma descrição',
      },
      issues: {
        description: 'Adicione referências a issues (ex.: "fix #123", "re #123".)',
      },
    },
  },
};
