import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes CSS usando clsx e tailwind-merge
 * @param inputs Classes CSS a serem combinadas
 * @returns String com as classes CSS combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor monetário
 * @param value Valor a ser formatado
 * @param locale Localização para formatação (padrão: pt-BR)
 * @param currency Moeda para formatação (padrão: BRL)
 * @returns String formatada com o valor monetário
 */
export function formatCurrency(value: number | string, locale = 'pt-BR', currency = 'BRL'): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(numericValue);
}

/**
 * Formata uma data
 * @param date Data a ser formatada
 * @param locale Localização para formatação (padrão: pt-BR)
 * @returns String formatada com a data
 */
export function formatDate(date: Date | string, locale = 'pt-BR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formata um número de telefone
 * @param phone Número de telefone a ser formatado
 * @returns String formatada com o número de telefone
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Formata um CPF
 * @param cpf CPF a ser formatado
 * @returns String formatada com o CPF
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cpf;
}

/**
 * Formata um CNPJ
 * @param cnpj CNPJ a ser formatado
 * @returns String formatada com o CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
  }
  return cnpj;
}

/**
 * Formata um CEP
 * @param cep CEP a ser formatado
 * @returns String formatada com o CEP
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{5})(\d{3})$/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return cep;
}

/**
 * Gera um slug a partir de uma string
 * @param str String para gerar o slug
 * @returns String formatada como slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Trunca uma string para um tamanho máximo
 * @param str String a ser truncada
 * @param length Tamanho máximo da string
 * @param suffix Sufixo a ser adicionado quando a string é truncada
 * @returns String truncada
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) {
    return str;
  }
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Gera um ID único
 * @returns String com ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Delay promise
 * @param ms Tempo em milissegundos
 * @returns Promise que resolve após o tempo especificado
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retorna um número aleatório entre min e max
 * @param min Valor mínimo
 * @param max Valor máximo
 * @returns Número aleatório
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Retorna um elemento aleatório de um array
 * @param arr Array de elementos
 * @returns Elemento aleatório
 */
export function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Embaralha um array
 * @param arr Array a ser embaralhado
 * @returns Array embaralhado
 */
export function shuffle<T>(arr: T[]): T[] {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * Agrupa um array de objetos por uma chave
 * @param arr Array de objetos
 * @param key Chave para agrupar
 * @returns Objeto com os grupos
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      return {
        ...groups,
        [groupKey]: [...(groups[groupKey] || []), item],
      };
    },
    {} as Record<string, T[]>
  );
}
