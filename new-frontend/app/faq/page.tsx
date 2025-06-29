'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Card, CardContent } from '@/components/ui/Card';
import { HelpCircle } from 'lucide-react';

export default function FAQ() {
  const faqItems = [
    {
      question: 'Como criar uma nova assinatura?',
      answer:
        "Para criar uma assinatura: 1) Vá em 'Nova Assinatura' no menu, 2) Escolha a empresa e produtos desejados, 3) Selecione os dias de entrega, 4) Confirme seu endereço, 5) Realize o pagamento. Sua assinatura será ativada automaticamente após a confirmação do pagamento.",
    },
    {
      question: 'Posso pausar minha assinatura temporariamente?',
      answer:
        "Sim! Você pode pausar sua assinatura a qualquer momento em 'Minhas Assinaturas'. Durante o período de pausa, você não receberá produtos nem será cobrado. Para reativar, basta clicar em 'Reativar' na mesma página.",
    },
    {
      question: 'Como alterar o endereço de entrega?',
      answer:
        "Acesse 'Minhas Assinaturas', clique no menu de ações (três pontos) da assinatura desejada e selecione 'Alterar Endereço'. As alterações valerão para a próxima entrega.",
    },
    {
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer:
        'Sim, você pode cancelar a qualquer momento sem taxas. O cancelamento será efetivo ao final do período já pago, garantindo que você receba todas as entregas que já foram cobradas.',
    },
    {
      question: 'Em que horário são feitas as entregas?',
      answer:
        'Os horários de entrega variam por empresa, mas geralmente são feitas entre 6h e 10h da manhã para produtos frescos como pães. Você pode ver os horários específicos na página da empresa.',
    },
    {
      question: 'E se eu não estiver em casa na hora da entrega?',
      answer:
        'Entre em contato com a empresa através do sistema de suporte para combinar um local seguro (portaria, vizinho) ou reagendar a entrega. Cada empresa tem sua própria política para essas situações.',
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer:
        'Aceitamos cartões de crédito e débito através do Stripe. O pagamento é processado de forma segura e você recebe uma confirmação por email após cada transação.',
    },
    {
      question: 'Quando meu cartão é cobrado?',
      answer:
        "Seu cartão é cobrado semanalmente, no mesmo dia da semana em que você criou a assinatura. Você pode acompanhar todas as cobranças no menu 'Histórico Financeiro'.",
    },
    {
      question: 'Como entrar em contato com uma empresa?',
      answer:
        "Você pode usar o sistema de suporte integrado em 'Suporte' no menu principal. Escolha a empresa relacionada ao seu problema e envie sua mensagem diretamente.",
    },
    {
      question: 'Como fazer uma denúncia?',
      answer:
        "Para denúncias graves (fraude, má qualidade persistente, etc.), use o menu 'Denúncias' onde você pode reportar problemas diretamente para os administradores da plataforma.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-6 md:p-8">
      <div className="text-center">
        <HelpCircle className="mx-auto mb-4 h-12 w-12 text-slate-500" />
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Perguntas Frequentes</h1>
        <p className="text-slate-600">
          Encontre respostas para as dúvidas mais comuns sobre a plataforma.
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-slate-800 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
