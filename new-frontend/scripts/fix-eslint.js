const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para adicionar tipos de retorno em funções
function addReturnTypes(content) {
  return content
    .replace(/function\s+(\w+)\s*\([^)]*\)\s*{/g, 'function $1(): void {')
    .replace(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/g, 'const $1 = (): void => {');
}

// Função para corrigir aspas duplas para simples
function fixQuotes(content) {
  return content.replace(/"/g, "'");
}

// Função para adicionar chaves em ifs
function fixCurlyBraces(content) {
  return content
    .replace(/if\s*\([^)]+\)\s*(?!{)/g, (match) => `${match} {`)
    .replace(/}\s*else\s+(?!{)/g, '} else {');
}

// Função para fechar tags vazias
function fixSelfClosingTags(content) {
  return content.replace(/<([a-zA-Z]+)>\s*<\/\1>/g, '<$1 />');
}

// Função para escapar aspas em JSX
function escapeJSXQuotes(content) {
  return content.replace(/(\s)"([^"]+)"/g, (match, space, content) => `${space}"${content}"`);
}

// Função principal para processar arquivos
function processFile(filePath) {
  console.log(`Processando: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  content = addReturnTypes(content);
  content = fixQuotes(content);
  content = fixCurlyBraces(content);
  content = fixSelfClosingTags(content);
  content = escapeJSXQuotes(content);

  fs.writeFileSync(filePath, content);
}

// Função para processar diretório recursivamente
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      processFile(filePath);
    }
  });
}

// Diretórios a serem processados
const directories = ['app', 'components', 'lib'];

// Processar cada diretório
directories.forEach((dir) => {
  processDirectory(path.join(process.cwd(), dir));
});

// Executar ESLint --fix
console.log('Executando ESLint --fix...');
execSync('npx eslint --fix "**/*.{ts,tsx,js,jsx}"', { stdio: 'inherit' });

console.log('Correções concluídas!');
