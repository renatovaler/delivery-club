import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Shield,
  BookOpen,
  Users,
  Building2,
  ShoppingCart
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function FAQ() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  // FAQs específicos para cada tipo de usuário
  const getFAQsByUserType = (userType) => {
    const faqs = {
      customer: {
        title: "FAQ - Cliente",
        icon: ShoppingCart,
        color: "bg-blue-500",
        categories: [
          {
            name: "Assinaturas",
            items: [
              {
                id: "sub-1",
                question: "Como criar uma nova assinatura?",
                answer: "Para criar uma assinatura: 1) Vá em 'Nova Assinatura' no menu, 2) Escolha a empresa e produtos desejados, 3) Selecione os dias de entrega, 4) Confirme seu endereço, 5) Realize o pagamento. Sua assinatura será ativada automaticamente após a confirmação do pagamento."
              },
              {
                id: "sub-2",
                question: "Posso pausar minha assinatura temporariamente?",
                answer: "Sim! Você pode pausar sua assinatura a qualquer momento em 'Minhas Assinaturas'. Durante o período de pausa, você não receberá produtos nem será cobrado. Para reativar, basta clicar em 'Reativar' na mesma página."
              },
              {
                id: "sub-3",
                question: "Como alterar o endereço de entrega?",
                answer: "Acesse 'Minhas Assinaturas', clique no menu de ações (três pontos) da assinatura desejada e selecione 'Alterar Endereço'. As alterações valerão para a próxima entrega."
              },
              {
                id: "sub-4",
                question: "Quando sou cobrado pela assinatura?",
                answer: "As cobranças são feitas semanalmente, sempre no mesmo dia da semana em que você criou a assinatura. Você recebe uma notificação antes de cada cobrança."
              },
              {
                id: "sub-5",
                question: "Posso cancelar minha assinatura a qualquer momento?",
                answer: "Sim, você pode cancelar a qualquer momento sem taxas. O cancelamento será efetivo ao final do período já pago, garantindo que você receba todas as entregas que já foram cobradas."
              }
            ]
          },
          {
            name: "Entregas",
            items: [
              {
                id: "del-1",
                question: "Em que horário são feitas as entregas?",
                answer: "Os horários de entrega variam por empresa, mas geralmente são feitas entre 6h e 10h da manhã para produtos frescos como pães. Você pode ver os horários específicos na página da empresa."
              },
              {
                id: "del-2",
                question: "E se eu não estiver em casa na hora da entrega?",
                answer: "Entre em contato com a empresa através do sistema de suporte para combinar um local seguro (portaria, vizinho) ou reagendar a entrega. Cada empresa tem sua própria política para essas situações."
              },
              {
                id: "del-3",
                question: "Como rastrear minhas entregas?",
                answer: "No seu Dashboard você pode ver as próximas entregas programadas. Para acompanhamento em tempo real, algumas empresas oferecem notificações via WhatsApp - consulte diretamente com a empresa."
              }
            ]
          },
          {
            name: "Pagamentos",
            items: [
              {
                id: "pay-1",
                question: "Quais formas de pagamento são aceitas?",
                answer: "Aceitamos cartões de crédito e débito através do Stripe. O pagamento é processado de forma segura e você recebe uma confirmação por email após cada transação."
              },
              {
                id: "pay-2",
                question: "Quando meu cartão é cobrado?",
                answer: "Seu cartão é cobrado semanalmente, no mesmo dia da semana em que você criou a assinatura. Você pode acompanhar todas as cobranças no menu 'Histórico Financeiro'."
              },
              {
                id: "pay-3",
                question: "Posso alterar meu método de pagamento?",
                answer: "Atualmente, para alterar o método de pagamento, você precisa cancelar a assinatura atual e criar uma nova com o novo cartão. Estamos trabalhando para facilitar esse processo."
              }
            ]
          },
          {
            name: "Suporte",
            items: [
              {
                id: "sup-1",
                question: "Como entrar em contato com uma empresa?",
                answer: "Você pode usar o sistema de suporte integrado em 'Suporte' no menu principal. Escolha a empresa relacionada ao seu problema e envie sua mensagem diretamente."
              },
              {
                id: "sup-2",
                question: "Como fazer uma denúncia?",
                answer: "Para denúncias graves (fraude, má qualidade persistente, etc.), use o menu 'Denúncias' onde você pode reportar problemas diretamente para os administradores da plataforma."
              }
            ]
          }
        ]
      },
      business_owner: {
        title: "FAQ - Empresário",
        icon: Building2,
        color: "bg-green-500",
        categories: [
          {
            name: "Gestão de Produtos",
            items: [
              {
                id: "prod-1",
                question: "Como adicionar novos produtos?",
                answer: "Acesse 'Produtos' no menu e clique em 'Novo Produto'. Preencha todas as informações obrigatórias: nome, categoria, preço, tipo de unidade e áreas de entrega onde o produto estará disponível."
              },
              {
                id: "prod-2",
                question: "Posso alterar o preço de produtos em assinaturas ativas?",
                answer: "Sim, mas as alterações de preço são agendadas para o próximo ciclo de faturamento dos clientes. Os clientes são notificados automaticamente sobre mudanças de preço com 7 dias de antecedência."
              },
              {
                id: "prod-3",
                question: "E se eu quiser remover um produto do catálogo?",
                answer: "Produtos em assinaturas ativas não podem ser removidos imediatamente. A remoção é agendada para o final do ciclo de faturamento atual de cada cliente, que são notificados sobre a descontinuação."
              },
              {
                id: "prod-4",
                question: "Como funciona o sistema de categorias?",
                answer: "As categorias ajudam os clientes a encontrar seus produtos mais facilmente. Escolha a categoria que melhor descreve seu produto. Produtos bem categorizados têm maior visibilidade."
              }
            ]
          },
          {
            name: "Áreas de Entrega",
            items: [
              {
                id: "area-1",
                question: "Como definir minhas áreas de cobertura?",
                answer: "Vá em 'Áreas de Cobertura' e cadastre cada região que você atende. Defina estado, cidade, bairro e, opcionalmente, condomínios específicos. Cada área pode ter sua própria taxa de entrega."
              },
              {
                id: "area-2",
                question: "Posso cobrar taxas diferentes por área?",
                answer: "Sim! Cada área de entrega pode ter sua própria taxa. Isso permite cobrar mais por locais mais distantes ou de difícil acesso, e menos (ou zero) para áreas próximas."
              },
              {
                id: "area-3",
                question: "Como expandir para novas regiões?",
                answer: "Simplesmente cadastre novas áreas de entrega em 'Áreas de Cobertura'. Lembre-se de configurar quais produtos estarão disponíveis em cada nova área."
              }
            ]
          },
          {
            name: "Clientes e Assinaturas",
            items: [
              {
                id: "client-1",
                question: "Como acompanhar meus clientes?",
                answer: "Em 'Clientes' você vê todos os seus assinantes, pode filtrar por status da assinatura, visualizar detalhes dos pedidos e acompanhar o histórico de cada cliente."
              },
              {
                id: "client-2",
                question: "Como organizar as entregas diárias?",
                answer: "Use a seção 'Gestão de Entregas' para ver todas as entregas programadas por data. Você pode filtrar por bairro, status e imprimir listas de entrega para seus funcionários."
              },
              {
                id: "client-3",
                question: "E se um cliente cancelar a assinatura?",
                answer: "Cancelamentos são processados automaticamente. O cliente continua recebendo até o final do período já pago. Você pode ver o histórico de cancelamentos no relatório de clientes."
              }
            ]
          },
          {
            name: "Financeiro e Pagamentos",
            items: [
              {
                id: "fin-1",
                question: "Como configurar minha conta Stripe?",
                answer: "Você configurou sua conta Stripe durante o cadastro inicial. Para alterar as chaves, vá em 'Configurações' > 'Pagamentos'. Certifique-se de usar chaves válidas para receber os pagamentos."
              },
              {
                id: "fin-2",
                question: "Quando recebo os pagamentos?",
                answer: "Os pagamentos são processados semanalmente pelo Stripe e transferidos para sua conta bancária conforme a política do Stripe (geralmente 2-7 dias úteis após a cobrança)."
              },
              {
                id: "fin-3",
                question: "Como acompanhar minha receita?",
                answer: "Use o menu 'Financeiro' para ver relatórios detalhados de receita, despesas e lucro. Você pode filtrar por período e exportar relatórios para sua contabilidade."
              },
              {
                id: "fin-4",
                question: "Posso registrar despesas no sistema?",
                answer: "Sim! Em 'Financeiro' > 'Despesas' você pode registrar todos os custos do seu negócio categorizados (ingredientes, combustível, marketing, etc.) para acompanhar sua rentabilidade."
              }
            ]
          },
          {
            name: "Equipe",
            items: [
              {
                id: "team-1",
                question: "Como adicionar funcionários?",
                answer: "Em 'Equipe' você pode convidar funcionários por email. Defina o papel de cada um (gerente, funcionário, entregador) e eles receberão acesso às funcionalidades apropriadas."
              },
              {
                id: "team-2",
                question: "Quais são os diferentes papéis?",
                answer: "Proprietário (você) tem acesso total. Gerentes podem ver relatórios e gerenciar produtos. Funcionários podem ver pedidos e entregas. Entregadores têm acesso apenas às suas rotas de entrega."
              }
            ]
          }
        ]
      },
      system_admin: {
        title: "FAQ - Administrador",
        icon: Shield,
        color: "bg-red-500",
        categories: [
          {
            name: "Gestão da Plataforma",
            items: [
              {
                id: "admin-1",
                question: "Como monitorar a saúde da plataforma?",
                answer: "Use o Dashboard Administrativo para ver métricas gerais: número de empresas ativas, clientes, receita total e alertas do sistema. Verifique regularmente os logs de erro e performance."
              },
              {
                id: "admin-2",
                question: "Como gerenciar empresas problemáticas?",
                answer: "Em 'Empresas' você pode suspender, reativar ou cancelar contas de empresas. Antes de tomar ações drásticas, tente resolver via sistema de suporte interno."
              },
              {
                id: "admin-3",
                question: "Como funcionam os planos de assinatura?",
                answer: "Em 'Planos' você define os limites para cada tipo de conta empresarial: número máximo de produtos, áreas de entrega e clientes. Empresas são automaticamente limitadas conforme seu plano."
              }
            ]
          },
          {
            name: "Suporte e Denúncias",
            items: [
              {
                id: "sup-admin-1",
                question: "Como priorizar tickets de suporte?",
                answer: "Tickets são automaticamente categorizados por prioridade. Foque primeiro em 'Urgente' (problemas de pagamento, fraudes) depois 'Alto' (qualidade, entregas) e por último questões gerais."
              },
              {
                id: "sup-admin-2",
                question: "Como investigar denúncias?",
                answer: "Denúncias aparecem em uma seção separada. Analise as evidências fornecidas, entre em contato com as partes envolvidas e documente suas ações. Casos graves podem resultar em suspensão de contas."
              },
              {
                id: "sup-admin-3",
                question: "Quando suspender uma empresa?",
                answer: "Suspenda empresas em casos de: fraude comprovada, múltiplas reclamações de má qualidade, não cumprimento de entregas, problemas graves de higiene ou violação dos termos de uso."
              }
            ]
          },
          {
            name: "Relatórios e Analytics",
            items: [
              {
                id: "rep-1",
                question: "Quais métricas são mais importantes?",
                answer: "Monitore: taxa de crescimento de usuários, receita por empresa, churn rate (cancelamentos), tickets de suporte por empresa, e tempo médio de resolução de problemas."
              },
              {
                id: "rep-2",
                question: "Como identificar empresas em crescimento?",
                answer: "Use os relatórios para identificar empresas com crescimento consistente de clientes e receita. Essas empresas podem precisar de upgrade de plano ou suporte para expansão."
              },
              {
                id: "rep-3",
                question: "Como detectar problemas precocemente?",
                answer: "Configure alertas para: aumento súbito de cancelamentos, queda na receita de empresas, aumento de tickets de suporte e empresas próximas do limite de seus planos."
              }
            ]
          },
          {
            name: "Manutenção Técnica",
            items: [
              {
                id: "tech-1",
                question: "Como funcionam os processamentos automáticos?",
                answer: "O sistema processa automaticamente: cancelamentos agendados, atualizações de preço, notificações de cobrança e limpeza de dados. Monitore os logs desses processos diariamente."
              },
              {
                id: "tech-2",
                question: "Como resolver problemas de pagamento?",
                answer: "Problemas de pagamento geralmente são relacionados às configurações Stripe das empresas. Verifique se as chaves estão corretas e se as contas Stripe estão ativas."
              },
              {
                id: "tech-3",
                question: "Como fazer backup dos dados?",
                answer: "Os backups são feitos automaticamente pela infraestrutura. Para dados críticos, considere exportações manuais regulares dos relatórios principais."
              }
            ]
          }
        ]
      }
    };

    return faqs[userType] || faqs.customer;
  };

  const filterItems = (items, searchTerm) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse h-8 bg-amber-200 rounded w-1/3"></div>
      </div>
    );
  }

  const faqData = getFAQsByUserType(user?.user_type);
  const IconComponent = faqData.icon;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className={`mx-auto w-16 h-16 ${faqData.color} rounded-2xl flex items-center justify-center shadow-lg mb-4`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">{faqData.title}</h1>
        <p className="text-amber-600">
          Encontre respostas para as dúvidas mais comuns
        </p>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Pesquisar perguntas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categorias e Perguntas */}
      <div className="space-y-6">
        {faqData.categories.map((category) => {
          const filteredItems = filterItems(category.items, searchTerm);
          
          if (filteredItems.length === 0) return null;

          return (
            <Card key={category.name} className="shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {category.name}
                  <Badge variant="outline" className="ml-auto">
                    {filteredItems.length} pergunta{filteredItems.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-amber-100 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-amber-900 pr-4">
                          {item.question}
                        </span>
                        {openItems.has(item.id) ? (
                          <ChevronDown className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        )}
                      </button>
                      {openItems.has(item.id) && (
                        <div className="px-4 pb-4 pt-2 bg-amber-50/50 border-t border-amber-100">
                          <p className="text-amber-800 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Links de suporte adicional */}
      {user?.user_type === 'customer' && (
        <Card className="shadow-lg border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Ainda precisa de ajuda?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to={createPageUrl("CustomerSupport")}>
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Entrar em Contato
                </Button>
              </Link>
              <Link to={createPageUrl("PlatformReports")}>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Fazer Denúncia
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pesquisa sem resultados */}
      {searchTerm && faqData.categories.every(cat => filterItems(cat.items, searchTerm).length === 0) && (
        <Card className="shadow-lg border-amber-200">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              Nenhuma pergunta encontrada
            </h3>
            <p className="text-amber-600 mb-4">
              Não encontramos perguntas relacionadas a "{searchTerm}"
            </p>
            <Button 
              onClick={() => setSearchTerm("")}
              variant="outline"
            >
              Limpar Pesquisa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}