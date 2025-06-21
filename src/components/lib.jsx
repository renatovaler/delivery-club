import { Notification } from '@/api/entities';

export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Constantes dos dias da semana
export const DAYS_OF_WEEK = [
  { label: 'Segunda-feira', value: 'monday', jsDay: 1 },
  { label: 'Terça-feira', value: 'tuesday', jsDay: 2 },
  { label: 'Quarta-feira', value: 'wednesday', jsDay: 3 },
  { label: 'Quinta-feira', value: 'thursday', jsDay: 4 },
  { label: 'Sexta-feira', value: 'friday', jsDay: 5 },
  { label: 'Sábado', value: 'saturday', jsDay: 6 },
  { label: 'Domingo', value: 'sunday', jsDay: 0 }
];

// Estados brasileiros
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Categorias de despesas
export const EXPENSE_CATEGORIES = [
  'Ingredientes',
  'Embalagens',
  'Combustível',
  'Manutenção',
  'Marketing',
  'Pessoal',
  'Impostos',
  'Outros'
];

// Categorias expandidas de produtos
export const PRODUCT_CATEGORIES = [
  // Alimentação - Padaria e Confeitaria
  { value: "paes", label: "Pães", icon: "🥖", group: "Alimentação" },
  { value: "bolos", label: "Bolos e Tortas", icon: "🎂", group: "Alimentação" },
  { value: "doces", label: "Doces e Sobremesas", icon: "🍰", group: "Alimentação" },
  { value: "salgados", label: "Salgados", icon: "🥐", group: "Alimentação" },
  
  // Alimentação - Açougue e Frios
  { value: "carnes", label: "Carnes Vermelhas", icon: "🥩", group: "Alimentação" },
  { value: "aves", label: "Aves", icon: "🐔", group: "Alimentação" },
  { value: "peixes", label: "Peixes e Frutos do Mar", icon: "🐟", group: "Alimentação" },
  { value: "frios", label: "Frios e Embutidos", icon: "🥓", group: "Alimentação" },
  { value: "queijos", label: "Queijos", icon: "🧀", group: "Alimentação" },
  
  // Alimentação - Hortifruti
  { value: "frutas", label: "Frutas", icon: "🍎", group: "Alimentação" },
  { value: "verduras", label: "Verduras e Folhas", icon: "🥬", group: "Alimentação" },
  { value: "legumes", label: "Legumes", icon: "🥕", group: "Alimentação" },
  { value: "temperos", label: "Temperos e Ervas", icon: "🌿", group: "Alimentação" },
  
  // Alimentação - Mercearia
  { value: "graos", label: "Grãos e Cereais", icon: "🌾", group: "Alimentação" },
  { value: "conservas", label: "Conservas e Enlatados", icon: "🥫", group: "Alimentação" },
  { value: "condimentos", label: "Condimentos e Molhos", icon: "🍯", group: "Alimentação" },
  { value: "laticinios", label: "Laticínios", icon: "🥛", group: "Alimentação" },
  { value: "congelados", label: "Congelados", icon: "🧊", group: "Alimentação" },
  
  // Bebidas
  { value: "bebidas_alcoolicas", label: "Bebidas Alcoólicas", icon: "🍷", group: "Bebidas" },
  { value: "refrigerantes", label: "Refrigerantes", icon: "🥤", group: "Bebidas" },
  { value: "sucos", label: "Sucos Naturais", icon: "🧃", group: "Bebidas" },
  { value: "agua", label: "Água", icon: "💧", group: "Bebidas" },
  { value: "cafe_cha", label: "Café e Chás", icon: "☕", group: "Bebidas" },
  
  // Farmácia e Saúde
  { value: "medicamentos", label: "Medicamentos", icon: "💊", group: "Saúde" },
  { value: "higiene_pessoal", label: "Higiene Pessoal", icon: "🧴", group: "Saúde" },
  { value: "cosmeticos", label: "Cosméticos", icon: "💄", group: "Saúde" },
  { value: "suplementos", label: "Suplementos", icon: "🍃", group: "Saúde" },
  { value: "primeiros_socorros", label: "Primeiros Socorros", icon: "🩹", group: "Saúde" },
  
  // Casa e Limpeza
  { value: "limpeza", label: "Produtos de Limpeza", icon: "🧽", group: "Casa" },
  { value: "papel_higiene", label: "Papel Higiênico e Toalhas", icon: "🧻", group: "Casa" },
  { value: "decoracao", label: "Decoração", icon: "🕯️", group: "Casa" },
  { value: "utensilio_domestico", label: "Utensílios Domésticos", icon: "🍴", group: "Casa" },
  
  // Pet Shop
  { value: "racao_pets", label: "Ração para Pets", icon: "🐕", group: "Pets" },
  { value: "brinquedos_pets", label: "Brinquedos para Pets", icon: "🎾", group: "Pets" },
  { value: "higiene_pets", label: "Higiene para Pets", icon: "🛁", group: "Pets" },
  { value: "acessorios_pets", label: "Acessórios para Pets", icon: "🦴", group: "Pets" },
  
  // Eletrônicos e Tecnologia
  { value: "celulares", label: "Celulares e Smartphones", icon: "📱", group: "Tecnologia" },
  { value: "acessorios_tech", label: "Acessórios Tecnológicos", icon: "🔌", group: "Tecnologia" },
  { value: "informatica", label: "Informática", icon: "💻", group: "Tecnologia" },
  { value: "eletrodomesticos", label: "Eletrodomésticos", icon: "🏠", group: "Tecnologia" },
  
  // Vestuário e Acessórios
  { value: "roupas", label: "Roupas", icon: "👕", group: "Moda" },
  { value: "calcados", label: "Calçados", icon: "👟", group: "Moda" },
  { value: "acessorios_moda", label: "Acessórios de Moda", icon: "👜", group: "Moda" },
  { value: "joias", label: "Joias e Bijuterias", icon: "💍", group: "Moda" },
  
  // Livraria e Papelaria
  { value: "livros", label: "Livros", icon: "📚", group: "Educação" },
  { value: "material_escolar", label: "Material Escolar", icon: "✏️", group: "Educação" },
  { value: "papelaria", label: "Papelaria", icon: "📋", group: "Educação" },
  
  // Flores e Plantas
  { value: "flores", label: "Flores", icon: "🌸", group: "Jardinagem" },
  { value: "plantas", label: "Plantas e Mudas", icon: "🌱", group: "Jardinagem" },
  { value: "jardinagem", label: "Artigos de Jardinagem", icon: "🌿", group: "Jardinagem" },
  
  // Automotivo
  { value: "pecas_auto", label: "Peças Automotivas", icon: "🔧", group: "Automotivo" },
  { value: "acessorios_auto", label: "Acessórios Automotivos", icon: "🚗", group: "Automotivo" },
  
  // Esportes e Lazer
  { value: "equipamentos_esporte", label: "Equipamentos Esportivos", icon: "⚽", group: "Esportes" },
  { value: "roupas_esporte", label: "Roupas Esportivas", icon: "🏃", group: "Esportes" },
  { value: "brinquedos", label: "Brinquedos", icon: "🧸", group: "Esportes" },
  
  // Outros
  { value: "outros", label: "Outros", icon: "📦", group: "Outros" }
];

// Mensagens padrão
export const DEFAULT_MESSAGES = {
  SUCCESS_SAVE: 'Salvo com sucesso',
  SUCCESS_UPDATE: 'Atualizado com sucesso',
  SUCCESS_DELETE: 'Removido com sucesso',
  ERROR_SAVE: 'Erro ao salvar',
  ERROR_UPDATE: 'Erro ao atualizar',
  ERROR_DELETE: 'Erro ao remover',
  ERROR_LOAD: 'Erro ao carregar dados'
};

// Função centralizada para traduções
export const translations = {
  userTypes: {
    'system_admin': 'Administrador do Sistema',
    'business_owner': 'Empresário',
    'customer': 'Cliente'
  },
  
  subscriptionStatuses: {
    'active': 'Ativa',
    'paused': 'Pausada',
    'cancelled': 'Cancelada',
    'pending_payment': 'Pagamento Pendente',
    'past_due': 'Vencida',
    'trial': 'Período Trial'
  },
  
  bakeryStatuses: {
    'active': 'Ativa',
    'inactive': 'Inativa',
    'suspended': 'Suspensa',
    'cancellation_pending': 'Cancelamento Pendente',
    'cancelled': 'Cancelada'
  },
  
  teamRoles: {
    'owner': 'Proprietário',
    'manager': 'Gerente',
    'employee': 'Funcionário',
    'delivery_person': 'Entregador'
  },
  
  memberStatuses: {
    'active': 'Ativo',
    'inactive': 'Inativo',
    'pending': 'Pendente'
  },
  
  weekDays: {
    'monday': 'Segunda-feira',
    'tuesday': 'Terça-feira',
    'wednesday': 'Quarta-feira',
    'thursday': 'Thursday-feira',
    'friday': 'Sexta-feira',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
  },
  
  weekDaysShort: {
    'monday': 'Seg',
    'tuesday': 'Ter',
    'wednesday': 'Qua',
    'thursday': 'Qui',
    'friday': 'Sex',
    'saturday': 'Sáb',
    'sunday': 'Dom'
  },
  
  areaStatuses: {
    'active': 'Ativa',
    'inactive': 'Inativa'
  },
  
  invoiceStatuses: {
    'pending': 'Pendente',
    'paid': 'Pago',
    'overdue': 'Vencido',
    'cancelled': 'Cancelado'
  }
};

// Função utilitária para traduzir
export const translate = (category, key) => {
  return translations[category]?.[key] || key;
};

// Nova função centralizada para criar notificações
export const createNotification = async ({ userId, title, message, linkTo, icon }) => {
    if (!userId || !title || !message) {
        console.error("Dados insuficientes para criar notificação.");
        return;
    }

    try {
        await Notification.create({
            user_id: userId,
            title,
            message,
            link_to: linkTo || '#',
            icon: icon || 'BellRing',
            status: 'unread'
        });
    } catch (error) {
        console.error("Falha ao criar notificação:", error);
    }
};