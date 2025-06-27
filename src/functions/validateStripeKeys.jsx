import Stripe from 'npm:stripe@15.8.0';

Deno.serve(async (req) => {
    console.log('[validateStripeKeys] Iniciando validação...');
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ 
            valid: false, 
            error: 'Método não permitido' 
        }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await req.text();
        console.log('[validateStripeKeys] Body recebido:', body);
        
        const { public_key, secret_key } = JSON.parse(body);
        console.log('[validateStripeKeys] Chaves recebidas:', { 
            public_key: public_key ? public_key.substring(0, 10) + '...' : 'null',
            secret_key: secret_key ? secret_key.substring(0, 10) + '...' : 'null'
        });
        
        if (!public_key || !secret_key) {
            console.log('[validateStripeKeys] Chaves faltando');
            return new Response(JSON.stringify({ 
                valid: false, 
                error: 'Chaves públicas e secretas são obrigatórias' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validar formato das chaves
        if (!public_key.startsWith('pk_')) {
            console.log('[validateStripeKeys] Chave pública com formato inválido');
            return new Response(JSON.stringify({ 
                valid: false, 
                error: 'Chave pública deve começar com "pk_"' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!secret_key.startsWith('sk_')) {
            console.log('[validateStripeKeys] Chave secreta com formato inválido');
            return new Response(JSON.stringify({ 
                valid: false, 
                error: 'Chave secreta deve começar com "sk_"' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verificar se as chaves são do mesmo ambiente (test/live)
        const publicEnv = public_key.includes('_test_') ? 'test' : 'live';
        const secretEnv = secret_key.includes('_test_') ? 'test' : 'live';
        
        if (publicEnv !== secretEnv) {
            console.log('[validateStripeKeys] Ambientes diferentes');
            return new Response(JSON.stringify({ 
                valid: false, 
                error: 'As chaves pública e secreta devem ser do mesmo ambiente (test ou live)' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('[validateStripeKeys] Testando conexão com Stripe...');
        
        try {
            // Testar a chave secreta fazendo uma chamada à API do Stripe
            const stripe = new Stripe(secret_key, {
                httpClient: Stripe.createFetchHttpClient()
            });

            // Fazer uma chamada simples para verificar se a chave funciona
            const account = await stripe.accounts.retrieve();
            console.log('[validateStripeKeys] Conta Stripe recuperada:', account.id);
            
            // Se chegou até aqui, as chaves são válidas
            const response = { 
                valid: true,
                account_id: account.id,
                account_email: account.email,
                country: account.country,
                environment: secretEnv,
                charges_enabled: account.charges_enabled
            };
            
            console.log('[validateStripeKeys] Validação bem-sucedida:', response);

            return new Response(JSON.stringify(response), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (stripeError) {
            console.error('[validateStripeKeys] Erro na API do Stripe:', stripeError);
            
            let errorMessage = 'Chave secreta inválida ou conta Stripe não configurada corretamente';
            
            if (stripeError.code === 'invalid_api_key') {
                errorMessage = 'Chave secreta inválida. Verifique se você copiou corretamente do dashboard do Stripe.';
            } else if (stripeError.code === 'authentication_required') {
                errorMessage = 'Chave secreta não tem permissões suficientes.';
            } else if (stripeError.message) {
                errorMessage = stripeError.message;
            }

            return new Response(JSON.stringify({ 
                valid: false, 
                error: errorMessage 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('[validateStripeKeys] Erro geral:', error);
        return new Response(JSON.stringify({ 
            valid: false, 
            error: 'Erro interno do servidor durante a validação' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});