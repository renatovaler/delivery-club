// Forçando reimplantação da função de criação de checkout - v2.0
import { createClient } from 'npm:@base44/sdk@0.1.0';
import Stripe from 'npm:stripe@15.8.0';

// Carrega a chave de API do sistema e a chave secreta do Stripe no início
const BASE44_API_KEY = Deno.env.get("BASE44_API_KEY");
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY");

// Inicializa o cliente Base44 com a chave de API do servidor para operações internas.
const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
    apiKey: BASE44_API_KEY,
});

Deno.serve(async (req) => {
    // Verificação inicial e crítica: A plataforma TEM que ter uma chave Stripe configurada.
    if (!STRIPE_SECRET) {
        console.error("[CreateCheckout] FATAL: A variável de ambiente STRIPE_SECRET_KEY não foi encontrada.");
        return new Response(JSON.stringify({ error: "A configuração de pagamento do sistema está ausente. Contate o suporte técnico." }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }

    try {
        console.log('[CreateCheckout] Iniciando processamento...');
        
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        
        // Define o token do usuário para obter o contexto de quem está fazendo a chamada
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        console.log('[CreateCheckout] Usuário autenticado:', user.email);

        const { amount, description, metadata, success_url, cancel_url } = await req.json();
        
        if (!amount || !description || !success_url || !cancel_url || !metadata) {
            return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios ausentes' }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        
        let stripeSecretKey;
        
        if (metadata.type === 'business_plan_subscription') {
            stripeSecretKey = STRIPE_SECRET; // Usa a chave da plataforma
        } else if (metadata.team_id) {
            const team = await base44.entities.Team.get(metadata.team_id);
            if (!team || !team.stripe_secret_key) {
                return new Response(JSON.stringify({ error: 'A empresa não está configurada para pagamentos.' }), { status: 400, headers: { "Content-Type": "application/json" } });
            }
            stripeSecretKey = team.stripe_secret_key; // Usa a chave da empresa
        }

        if (!stripeSecretKey) {
             return new Response(JSON.stringify({ error: 'Não foi possível determinar a configuração de pagamento para esta transação.' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
        
        const stripe = new Stripe(stripeSecretKey, {
            httpClient: Stripe.createFetchHttpClient()
        });
        
        let customerId = user.stripe_customer_id;
        if (!customerId) {
            console.log(`[CreateCheckout] Usuário ${user.email} não possui ID de cliente Stripe. Criando...`);
            const customer = await stripe.customers.create({ email: user.email, name: user.full_name });
            customerId = customer.id;
            await base44.entities.User.update(user.id, { stripe_customer_id: customerId });
            console.log(`[CreateCheckout] Cliente ${customerId} criado e associado ao usuário.`);
        }
        
        const isBusinessPlan = metadata.type === 'business_plan_subscription';
        let sessionPayload;

        if (metadata.type === 'invoice_payment') {
            sessionPayload = {
                payment_method_types: ['card'],
                line_items: [{
                    price_data: { currency: 'brl', product_data: { name: description }, unit_amount: amount },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url,
                cancel_url,
                metadata,
            };
        } else { // Para assinaturas
            sessionPayload = {
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'brl',
                        product_data: { name: description },
                        unit_amount: amount,
                        recurring: { interval: 'month' }, // Sempre mensal agora
                    },
                    quantity: 1,
                }],
                mode: 'subscription',
                success_url,
                cancel_url,
                metadata,
                subscription_data: { metadata },
            };
        }

        sessionPayload.customer = customerId;

        let session;
        try {
            session = await stripe.checkout.sessions.create(sessionPayload);
        } catch (error) {
            // Se o cliente não existe no Stripe, cria um novo e tenta novamente
            if (error.code === 'resource_missing' && error.param === 'customer') {
                console.warn(`[CreateCheckout] Cliente ${customerId} inválido no Stripe. Criando um novo para ${user.email}.`);
                const newCustomer = await stripe.customers.create({ email: user.email, name: user.full_name });
                customerId = newCustomer.id;
                await base44.entities.User.update(user.id, { stripe_customer_id: customerId });
                console.log(`[CreateCheckout] Novo cliente ${customerId} criado e associado.`);
                
                sessionPayload.customer = customerId; 
                session = await stripe.checkout.sessions.create(sessionPayload);
                console.log(`[CreateCheckout] Sessão criada com sucesso na segunda tentativa.`);
            } else {
                throw error;
            }
        }
        
        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error('[CreateCheckout] Erro geral:', error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor: ' + error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});