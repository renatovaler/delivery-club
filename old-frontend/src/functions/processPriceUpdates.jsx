
import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        const user = await base44.auth.me();
        if (!user || user.user_type !== 'system_admin') {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Buscar atualizações de preço que devem ser aplicadas hoje
        const pendingUpdates = await base44.entities.PriceUpdate.filter({
            status: 'pending',
            effective_date: today
        });

        let processedCount = 0;
        let notificationsSent = 0;

        for (const update of pendingUpdates) {
            try {
                // 1. Atualizar o preço do produto
                await base44.entities.Product.update(update.product_id, {
                    price_per_unit: update.new_price
                });

                // 2. Buscar todas as assinaturas ativas que contêm este produto
                const subscriptionItems = await base44.entities.SubscriptionItem.filter({
                    product_id: update.product_id
                });

                const activeSubscriptionIds = [];
                const affectedCustomers = new Set();

                for (const item of subscriptionItems) {
                    const subscription = await base44.entities.Subscription.get(item.subscription_id);
                    if (subscription && subscription.status === 'active') {
                        activeSubscriptionIds.push(subscription.id);
                        affectedCustomers.add(subscription.customer_id);
                        
                        // Atualizar o preço unitário no item da assinatura
                        await base44.entities.SubscriptionItem.update(item.id, {
                            unit_price: update.new_price
                        });
                    }
                }

                // 3. Recalcular o valor semanal das assinaturas afetadas
                for (const subscriptionId of activeSubscriptionIds) {
                    const items = await base44.entities.SubscriptionItem.filter({
                        subscription_id: subscriptionId
                    });
                    
                    let totalWeeklyPrice = 0;
                    for (const item of items) {
                        let deliveriesPerWeek = 0;
                        if (item.frequency === 'weekly') {
                            deliveriesPerWeek = item.delivery_days ? item.delivery_days.length : 0;
                        } else if (item.frequency === 'bi-weekly') {
                            deliveriesPerWeek = 0.5;
                        } else if (item.frequency === 'monthly') {
                            deliveriesPerWeek = 1 / 4.333;
                        }
                        totalWeeklyPrice += (item.quantity_per_delivery || 0) * (item.unit_price || 0) * deliveriesPerWeek;
                    }
                    
                    await base44.entities.Subscription.update(subscriptionId, {
                        weekly_price: totalWeeklyPrice
                    });
                }

                // 4. Enviar notificações para clientes afetados
                const product = await base44.entities.Product.get(update.product_id);
                const team = await base44.entities.Team.get(update.team_id);
                
                for (const customerId of affectedCustomers) {
                    const priceChangePercent = ((update.new_price - update.old_price) / update.old_price * 100).toFixed(1);
                    const isIncrease = update.new_price > update.old_price;
                    
                    await base44.entities.Notification.create({
                        user_id: customerId,
                        title: `${isIncrease ? 'Aumento' : 'Redução'} de Preço - ${team.name}`,
                        message: `O preço do produto "${product.name}" foi ${isIncrease ? 'aumentado' : 'reduzido'} em ${Math.abs(priceChangePercent)}% (de R$ ${update.old_price.toFixed(2)} para R$ ${update.new_price.toFixed(2)}). ${update.reason ? `Motivo: ${update.reason}` : ''} A mudança já está em vigor.`,
                        link_to: '/MySubscriptions',
                        icon: isIncrease ? 'AlertTriangle' : 'TrendingDown'
                    });
                    notificationsSent++;
                }

                // 5. Marcar a atualização como aplicada
                await base44.entities.PriceUpdate.update(update.id, {
                    status: 'applied',
                    notifications_sent: true
                });

                processedCount++;

            } catch (error) {
                console.error(`Erro ao processar atualização de preço ${update.id}:`, error);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            processed_updates: processedCount,
            notifications_sent: notificationsSent
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error('Erro no processamento de atualizações de preço:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});
