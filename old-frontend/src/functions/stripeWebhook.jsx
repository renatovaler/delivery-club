// Webhook do Stripe atualizado para cobrança mensal - v3.0
import { createClient } from 'npm:@base44/sdk@0.1.0';
import Stripe from 'npm:stripe@15.8.0';

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const BASE44_API_KEY = Deno.env.get("BASE44_API_KEY");

console.log('[Webhook] Inicializando webhook com configurações:');
console.log('STRIPE_SECRET_KEY:', !!STRIPE_SECRET_KEY);
console.log('STRIPE_WEBHOOK_SECRET:', !!STRIPE_WEBHOOK_SECRET);
console.log('BASE44_API_KEY:', !!BASE44_API_KEY);

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !BASE44_API_KEY) {
    console.error("ERRO FATAL: Uma ou mais variáveis de ambiente estão faltando.");
    throw new Error("Configuração incompleta do webhook");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient()
});

Deno.serve(async (req) => {
    console.log('[Webhook] Nova requisição recebida');
    
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, sig, STRIPE_WEBHOOK_SECRET);
        console.log(`[Webhook] ✅ Evento verificado: ${event.type} | ID: ${event.id}`);
    } catch (err) {
        console.error(`[Webhook] ❌ Erro na verificação da assinatura: ${err.message}`);
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    try {
        const base44 = createClient({
            appId: Deno.env.get('BASE44_APP_ID'),
            apiKey: BASE44_API_KEY,
        });

        console.log('[Webhook] Cliente Base44 criado com sucesso');

        // Verificar se já processamos este evento
        const existingEvent = await base44.entities.ProcessedEvent.filter({
            stripe_event_id: event.id
        });

        if (existingEvent.length > 0) {
            console.log(`[Webhook] Evento ${event.id} já foi processado anteriormente`);
            return new Response('Event already processed', { status: 200 });
        }

        // Processar evento baseado no tipo
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object, base44);
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object, base44);
                break;
            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object, base44);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object, base44);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object, base44);
                break;
            case 'invoice.created':
                await handleInvoiceCreated(event.data.object, base44);
                break;
            default:
                console.log(`[Webhook] Tipo de evento não tratado: ${event.type}`);
        }

        // Marcar evento como processado
        await base44.entities.ProcessedEvent.create({
            stripe_event_id: event.id,
            processed_at: new Date().toISOString()
        });

        console.log(`[Webhook] ✅ Evento ${event.id} processado e salvo com sucesso`);
        return new Response('Webhook processed successfully', { status: 200 });

    } catch (error) {
        console.error(`[Webhook] ❌ Erro ao processar webhook:`, error);
        console.error(`[Webhook] Stack trace:`, error.stack);
        return new Response(`Error processing webhook: ${error.message}`, { status: 500 });
    }
});

async function handleCheckoutSessionCompleted(session, base44) {
    console.log(`[Webhook] Processando checkout.session.completed: ${session.id}`);
    
    const metadata = session.metadata || {};
    if (!metadata.type) {
        console.log('[Webhook] Sessão sem metadados válidos');
        return;
    }

    try {
        if (metadata.type === 'subscription_payment' && metadata.subscription_id) {
            const subscription = await base44.entities.Subscription.get(metadata.subscription_id);
            
            if (subscription) {
                // Calcular próxima data de cobrança (30 dias a partir de hoje)
                const nextBillingDate = new Date();
                nextBillingDate.setDate(nextBillingDate.getDate() + 30);
                
                await base44.entities.Subscription.update(metadata.subscription_id, {
                    status: 'active',
                    stripe_subscription_id: session.subscription,
                    next_billing_date: nextBillingDate.toISOString().split('T')[0]
                });
                
                // Criar primeira fatura
                const today = new Date();
                const endDate = new Date(nextBillingDate);
                endDate.setDate(endDate.getDate() - 1); // Fim do período é um dia antes da próxima cobrança
                
                await base44.entities.Invoice.create({
                    subscription_id: subscription.id,
                    customer_id: subscription.customer_id,
                    team_id: subscription.team_id,
                    amount: subscription.monthly_price,
                    billing_period_start: today.toISOString().split('T')[0],
                    billing_period_end: endDate.toISOString().split('T')[0],
                    due_date: today.toISOString().split('T')[0],
                    paid_date: today.toISOString().split('T')[0],
                    status: 'paid',
                    stripe_invoice_id: session.invoice || '',
                    description: 'Primeira cobrança da assinatura'
                });
                
                console.log(`[Webhook] ✅ Assinatura ${metadata.subscription_id} ativada com sucesso`);
            }
        } else if (metadata.type === 'invoice_payment' && metadata.invoice_id) {
            await base44.entities.Invoice.update(metadata.invoice_id, {
                status: 'paid',
                paid_date: new Date().toISOString().split('T')[0]
            });
            console.log(`[Webhook] ✅ Fatura ${metadata.invoice_id} marcada como paga`);
        }
    } catch (error) {
        console.error('[Webhook] Erro ao processar checkout completed:', error);
        throw error;
    }
}

async function handleInvoicePaymentSucceeded(invoice, base44) {
    console.log(`[Webhook] Processando invoice.payment_succeeded: ${invoice.id}`);
    
    try {
        if (invoice.subscription) {
            const subscription = await base44.entities.Subscription.filter({
                stripe_subscription_id: invoice.subscription
            });
            
            if (subscription.length > 0) {
                const sub = subscription[0];
                
                // Calcular período de cobrança
                const paidDate = new Date(invoice.status_transitions.paid_at * 1000);
                const periodStart = new Date(invoice.period_start * 1000);
                const periodEnd = new Date(invoice.period_end * 1000);
                
                // Criar/atualizar fatura no nosso sistema
                await base44.entities.Invoice.create({
                    subscription_id: sub.id,
                    customer_id: sub.customer_id,
                    team_id: sub.team_id,
                    amount: invoice.amount_paid / 100,
                    billing_period_start: periodStart.toISOString().split('T')[0],
                    billing_period_end: periodEnd.toISOString().split('T')[0],
                    due_date: paidDate.toISOString().split('T')[0],
                    paid_date: paidDate.toISOString().split('T')[0],
                    status: 'paid',
                    stripe_invoice_id: invoice.id,
                    description: `Cobrança mensal - ${new Date(periodStart).toLocaleDateString('pt-BR')}`
                });
                
                // Atualizar próxima data de cobrança
                const nextBillingDate = new Date(periodEnd);
                nextBillingDate.setDate(nextBillingDate.getDate() + 1);
                
                await base44.entities.Subscription.update(sub.id, {
                    next_billing_date: nextBillingDate.toISOString().split('T')[0],
                    status: 'active'
                });
                
                console.log(`[Webhook] ✅ Fatura processada para assinatura ${sub.id}`);
            }
        }
    } catch (error) {
        console.error('[Webhook] Erro ao processar pagamento de fatura:', error);
        throw error;
    }
}

async function handleInvoicePaymentFailed(invoice, base44) {
    console.log(`[Webhook] Processando invoice.payment_failed: ${invoice.id}`);
    
    try {
        if (invoice.subscription) {
            const subscription = await base44.entities.Subscription.filter({
                stripe_subscription_id: invoice.subscription
            });
            
            if (subscription.length > 0) {
                const sub = subscription[0];
                
                await base44.entities.Subscription.update(sub.id, {
                    status: 'past_due'
                });
                
                console.log(`[Webhook] ✅ Assinatura ${sub.id} marcada como vencida`);
            }
        }
    } catch (error) {
        console.error('[Webhook] Erro ao processar falha no pagamento:', error);
        throw error;
    }
}

async function handleSubscriptionUpdated(stripeSubscription, base44) {
    console.log(`[Webhook] Processando subscription.updated: ${stripeSubscription.id}`);
    
    try {
        const subscription = await base44.entities.Subscription.filter({
            stripe_subscription_id: stripeSubscription.id
        });
        
        if (subscription.length > 0) {
            const sub = subscription[0];
            
            let status = 'active';
            switch (stripeSubscription.status) {
                case 'canceled':
                    status = 'cancelled';
                    break;
                case 'past_due':
                    status = 'past_due';
                    break;
                case 'paused':
                    status = 'paused';
                    break;
            }
            
            await base44.entities.Subscription.update(sub.id, { status });
            console.log(`[Webhook] ✅ Status da assinatura ${sub.id} atualizado para ${status}`);
        }
    } catch (error) {
        console.error('[Webhook] Erro ao atualizar assinatura:', error);
        throw error;
    }
}

async function handleSubscriptionDeleted(stripeSubscription, base44) {
    console.log(`[Webhook] Processando subscription.deleted: ${stripeSubscription.id}`);
    
    try {
        const subscription = await base44.entities.Subscription.filter({
            stripe_subscription_id: stripeSubscription.id
        });
        
        if (subscription.length > 0) {
            const sub = subscription[0];
            
            await base44.entities.Subscription.update(sub.id, {
                status: 'cancelled',
                cancellation_date: new Date().toISOString().split('T')[0]
            });
            
            console.log(`[Webhook] ✅ Assinatura ${sub.id} cancelada`);
        }
    } catch (error) {
        console.error('[Webhook] Erro ao cancelar assinatura:', error);
        throw error;
    }
}

async function handleInvoiceCreated(invoice, base44) {
    console.log(`[Webhook] Processando invoice.created: ${invoice.id}`);
    // Implementar se necessário para faturas futuras
}