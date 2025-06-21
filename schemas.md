Entidade: User
{
  "name": "User",
  "type": "object",
  "properties": {
    "phone": {
      "type": "string",
      "description": "Telefone do usuário"
    },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "number": { "type": "string" },
        "complement": { "type": "string" },
        "neighborhood": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "zip_code": { "type": "string" },
        "reference": { "type": "string" }
      },
      "description": "Endereço completo do usuário (obrigatório para clientes)"
    },
    "user_type": {
      "type": "string",
      "enum": ["system_admin", "business_owner", "customer"],
      "description": "Tipo de usuário no sistema"
    },
    "current_team_id": {
      "type": "string",
      "description": "ID da equipe/empresa atual do usuário"
    },
    "profile_picture": {
      "type": "string",
      "description": "URL da foto de perfil"
    },
    "stripe_customer_id": {
      "type": "string",
      "description": "ID do cliente no Stripe (cus_...) - criado automaticamente no primeiro pagamento"
    }
  },
  "required": []
}
Entidade: Team
{
  "name": "Team",
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Nome da empresa" },
    "cnpj_cpf": { "type": "string", "description": "CNPJ ou CPF do responsável pelo negócio" },
    "description": { "type": "string", "description": "Descrição da empresa" },
    "logo": { "type": "string", "description": "URL do logo da empresa" },
    "category": { "type": "string", "enum": ["padaria", "restaurante", "mercado", "farmacia", "outros"], "default": "outros", "description": "Categoria do negócio" },
    "owner_id": { "type": "string", "description": "ID do proprietário da empresa" },
    "contact": {
      "type": "object",
      "properties": {
        "whatsapp_numbers": { "type": "array", "items": { "type": "string" }, "description": "Números de WhatsApp para contato" },
        "email": { "type": "string", "description": "E-mail principal de contato" }
      },
      "required": ["whatsapp_numbers", "email"]
    },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "number": { "type": "string" },
        "complement": { "type": "string" },
        "neighborhood": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "zip_code": { "type": "string" },
        "reference": { "type": "string" }
      },
      "required": ["street", "number", "neighborhood", "city", "state", "zip_code"]
    },
    "status": { "type": "string", "enum": ["active", "inactive", "suspended"], "default": "active" },
    "subscription_status": { "type": "string", "enum": ["active", "paused", "cancelled", "trial", "cancellation_pending"], "default": "trial" },
    "plan_id": { "type": "string", "description": "ID do plano de assinatura associado" },
    "cancellation_effective_date": { "type": "string", "format": "date", "description": "Data em que o cancelamento será efetivado" },
    "settings": {
      "type": "object",
      "properties": {
        "bread_price": { "type": "number", "default": 0.5 },
        "min_order_quantity": { "type": "number", "default": 10 },
        "max_order_quantity": { "type": "number", "default": 100 }
      }
    },
    "stripe_public_key": { "type": "string", "description": "Chave pública do Stripe da empresa" },
    "stripe_secret_key": { "type": "string", "description": "Chave secreta do Stripe da empresa" }
  },
  "required": ["name", "category", "cnpj_cpf", "contact", "address"]
}
Entidade: TeamMember
{
  "name": "TeamMember",
  "type": "object",
  "properties": {
    "team_id": { "type": "string", "description": "ID da empresa" },
    "user_id": { "type": "string", "description": "ID do usuário (quando já aceito o convite)" },
    "user_email": { "type": "string", "description": "Email do usuário convidado" },
    "role": { "type": "string", "enum": ["owner", "manager", "employee", "delivery_person"], "description": "Função do membro na equipe" },
    "status": { "type": "string", "enum": ["active", "inactive", "pending"], "default": "pending" }
  },
  "required": ["team_id", "role"]
}
Entidade: Product
{
  "name": "Product",
  "type": "object",
  "properties": {
    "team_id": { "type": "string", "description": "ID da empresa que oferece o produto" },
    "name": { "type": "string", "description": "Nome do produto (ex: Pão Francês, Presunto Fatiado)" },
    "description": { "type": "string", "description": "Descrição detalhada do produto" },
    "category": { "type": "string", "enum": ["paes", "bolos", "doces", "salgados", "carnes", "aves", "peixes", "frios", "queijos", "frutas", "verduras", "legumes", "temperos", "graos", "conservas", "condimentos", "laticinios", "congelados", "bebidas_alcoolicas", "refrigerantes", "sucos", "agua", "cafe_cha", "medicamentos", "higiene_pessoal", "cosmeticos", "suplementos", "primeiros_socorros", "limpeza", "papel_higiene", "decoracao", "utensilio_domestico", "racao_pets", "brinquedos_pets", "higiene_pets", "acessorios_pets", "celulares", "acessorios_tech", "informatica", "eletrodomesticos", "roupas", "calcados", "acessorios_moda", "joias", "livros", "material_escolar", "papelaria", "flores", "plantas", "jardinagem", "pecas_auto", "acessorios_auto", "equipamentos_esporte", "roupas_esporte", "brinquedos", "outros"], "description": "Categoria do produto" },
    "unit_type": { "type": "string", "enum": ["unidade", "grama", "quilograma", "litro", "mililitro", "fatia"], "description": "Tipo de unidade para medição" },
    "price_per_unit": { "type": "number", "minimum": 0.01, "description": "Preço por unidade do produto" },
    "cost_per_unit": { "type": "number", "minimum": 0, "default": 0, "description": "Custo de produção por unidade do produto" },
    "minimum_quantity": { "type": "number", "default": 1, "description": "Quantidade mínima para pedido" },
    "maximum_quantity": { "type": "number", "default": 1000, "description": "Quantidade máxima para pedido" },
    "available_days": { "type": "array", "items": { "type": "string" }, "description": "Dias da semana em que o produto está disponível" },
    "available_area_ids": { "type": "array", "items": { "type": "string" }, "description": "IDs das áreas de entrega onde este produto está disponível" },
    "image_url": { "type": "string", "description": "URL da imagem do produto" },
    "status": { "type": "string", "enum": ["active", "inactive"], "default": "active", "description": "Status do produto" },
    "preparation_time": { "type": "number", "description": "Tempo de preparo em horas (para planejamento)" }
  },
  "required": ["team_id", "name", "category", "unit_type", "price_per_unit"]
}
Entidade: DeliveryArea
{
  "name": "DeliveryArea",
  "type": "object",
  "properties": {
    "team_id": { "type": "string", "description": "ID da empresa" },
    "state": { "type": "string", "description": "Estado" },
    "city": { "type": "string", "description": "Cidade" },
    "neighborhood": { "type": "string", "description": "Bairro" },
    "condominium": { "type": "string", "description": "Condomínio (se aplicável)", "default": "" },
    "delivery_fee": { "type": "number", "minimum": 0, "description": "Taxa de entrega para esta área" },
    "status": { "type": "string", "enum": ["active", "inactive"], "default": "active" },
    "notes": { "type": "string", "description": "Observações sobre a área" }
  },
  "required": ["team_id", "state", "city", "neighborhood", "delivery_fee"]
}
Entidade: Subscription
{
  "name": "Subscription",
  "type": "object",
  "properties": {
    "customer_id": { "type": "string", "description": "ID do cliente (usuário)" },
    "team_id": { "type": "string", "description": "ID da padaria" },
    "delivery_area_id": { "type": "string", "description": "ID da área de entrega" },
    "delivery_address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "number": { "type": "string" },
        "complement": { "type": "string" },
        "neighborhood": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "zip_code": { "type": "string" },
        "reference": { "type": "string" }
      }
    },
    "weekly_price": { "type": "number", "description": "Valor semanal total da assinatura (calculado)" },
    "status": { "type": "string", "enum": ["active", "paused", "cancelled", "pending_payment", "past_due", "trial"], "default": "pending_payment" },
    "start_date": { "type": "string", "format": "date", "description": "Data de início da assinatura" },
    "cancellation_date": { "type": "string", "format": "date", "description": "Data de cancelamento" },
    "stripe_subscription_id": { "type": "string", "description": "ID da assinatura no Stripe (sub_...)" },
    "special_instructions": { "type": "string", "description": "Instruções especiais para entrega" }
  },
  "required": ["customer_id", "team_id", "delivery_area_id", "weekly_price", "start_date"]
}
Entidade: SubscriptionItem
{
  "name": "SubscriptionItem",
  "type": "object",
  "properties": {
    "subscription_id": { "type": "string", "description": "ID da assinatura principal" },
    "product_id": { "type": "string", "description": "ID do produto" },
    "frequency": { "type": "string", "enum": ["weekly", "bi-weekly", "monthly"], "default": "weekly", "description": "Frequência da entrega (semanal, quinzenal, mensal)" },
    "delivery_days": { "type": "array", "items": { "type": "string" }, "description": "Dias da semana para entrega (usado se frequency='weekly')" },
    "biweekly_delivery_day": { "type": "string", "enum": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], "description": "Dia da semana para entrega quinzenal (usado se frequency='bi-weekly')" },
    "monthly_delivery_day": { "type": "number", "minimum": 1, "maximum": 28, "description": "Dia do mês para entrega mensal (usado se frequency='monthly')" },
    "quantity_per_delivery": { "type": "number", "description": "Quantidade do produto por entrega" },
    "unit_price": { "type": "number", "description": "Preço unitário do produto no momento da assinatura" },
    "weekly_subtotal": { "type": "number", "description": "Subtotal semanal para este item (quantidade × dias × preço)" }
  },
  "required": ["subscription_id", "product_id", "quantity_per_delivery", "unit_price"],
  "rls": {
    "read": {
      "created_by": "{{user.email}}"
    },
    "write": {
      "created_by": "{{user.email}}"
    }
  }
}
Entidade: Invoice
{
  "name": "Invoice",
  "type": "object",
  "properties": {
    "subscription_id": { "type": "string", "description": "ID da assinatura" },
    "customer_id": { "type": "string", "description": "ID do cliente" },
    "team_id": { "type": "string", "description": "ID da padaria" },
    "amount": { "type": "number", "description": "Valor da fatura" },
    "due_date": { "type": "string", "format": "date", "description": "Data de vencimento" },
    "paid_date": { "type": "string", "format": "date", "description": "Data de pagamento" },
    "status": { "type": "string", "enum": ["pending", "paid", "overdue", "cancelled"], "default": "pending" },
    "description": { "type": "string", "description": "Descrição da fatura" }
  },
  "required": ["subscription_id", "customer_id", "team_id", "amount", "due_date", "status"]
}
Entidade: Plan
{
  "name": "Plan",
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Nome do plano (Ex: Básico, Profissional)" },
    "description": { "type": "string", "description": "Descrição do plano" },
    "price": { "type": "number", "description": "Preço mensal do plano" },
    "max_delivery_areas": { "type": "number", "description": "Número máximo de áreas de entrega permitidas" },
    "max_subscriptions": { "type": "number", "description": "Número máximo de assinaturas de clientes ativas permitidas" },
    "max_products": { "type": "number", "description": "Número máximo de produtos que podem ser cadastrados" },
    "status": { "type": "string", "enum": ["active", "inactive"], "default": "active" }
  },
  "required": ["name", "price", "max_delivery_areas", "max_subscriptions", "max_products"],
  "type": "object"
}
Entidade: Expense
{
  "name": "Expense",
  "type": "object",
  "properties": {
    "team_id": { "type": "string", "description": "ID da padaria" },
    "description": { "type": "string", "description": "Descrição da despesa" },
    "amount": { "type": "number", "description": "Valor da despesa" },
    "category": { "type": "string", "description": "Categoria da despesa" },
    "date": { "type": "string", "format": "date", "description": "Data em que a despesa ocorreu" }
  },
  "required": ["team_id", "description", "amount", "category", "date"],
  "type": "object"
}
Entidade: Notification
{
  "name": "Notification",
  "type": "object",
  "properties": {
    "user_id": { "type": "string", "description": "ID do usuário que receberá a notificação" },
    "title": { "type": "string", "description": "Título da notificação" },
    "message": { "type": "string", "description": "Corpo da mensagem da notificação" },
    "status": { "type": "string", "enum": ["unread", "read"], "default": "unread", "description": "Status da notificação" },
    "link_to": { "type": "string", "description": "URL opcional para onde a notificação deve levar ao ser clicada" },
    "icon": { "type": "string", "description": "Nome de um ícone da biblioteca Lucide para ser exibido" }
  },
  "required": ["user_id", "title", "message"],
  "type": "object"
}
Entidade: PriceUpdate
{
  "name": "PriceUpdate",
  "type": "object",
  "properties": {
    "product_id": { "type": "string", "description": "ID do produto" },
    "team_id": { "type": "string", "description": "ID da empresa" },
    "old_price": { "type": "number", "description": "Preço anterior" },
    "new_price": { "type": "number", "description": "Novo preço" },
    "effective_date": { "type": "string", "format": "date", "description": "Data em que o novo preço entra em vigor" },
    "reason": { "type": "string", "description": "Motivo da alteração de preço" },
    "status": { "type": "string", "enum": ["pending", "applied", "cancelled"], "default": "pending", "description": "Status da atualização" },
    "notifications_sent": { "type": "boolean", "default": false, "description": "Se as notificações foram enviadas aos clientes" }
  },
  "required": ["product_id", "team_id", "old_price", "new_price", "effective_date"],
  "rls": {
    "read": {
      "created_by": "{{user.email}}"
    },
    "write": {
      "created_by": "{{user.email}}"
    }
  }
}
Entidade: ProcessedEvent
{
  "name": "ProcessedEvent",
  "type": "object",
  "properties": {
    "stripe_event_id": { "type": "string", "description": "ID do evento do Stripe (evt_...)" },
    "processed_at": { "type": "string", "format": "date-time", "description": "Timestamp de quando o evento foi processado" }
  },
  "required": ["stripe_event_id"]
}
Entidade: SupportTicket
{
  "name": "SupportTicket",
  "type": "object",
  "properties": {
    "customer_id": { "type": "string", "description": "ID do cliente que abriu o ticket" },
    "team_id": { "type": "string", "description": "ID da empresa (para suporte direto)" },
    "subscription_id": { "type": "string", "description": "ID da assinatura relacionada (opcional)" },
    "type": { "type": "string", "enum": ["support", "complaint", "suggestion", "delivery_issue", "product_issue", "billing_issue"], "description": "Tipo do ticket" },
    "priority": { "type": "string", "enum": ["low", "medium", "high", "urgent"], "default": "medium", "description": "Prioridade do ticket" },
    "status": { "type": "string", "enum": ["open", "in_progress", "waiting_customer", "waiting_business", "resolved", "closed"], "default": "open", "description": "Status do ticket" },
    "subject": { "type": "string", "description": "Assunto do ticket" },
    "description": { "type": "string", "description": "Descrição detalhada do problema" },
    "assigned_to": { "type": "string", "description": "ID do usuário responsável pelo atendimento" },
    "resolution": { "type": "string", "description": "Descrição da resolução (quando resolvido)" },
    "closed_at": { "type": "string", "format": "date-time", "description": "Data e hora do fechamento" },
    "rating": { "type": "number", "minimum": 1, "maximum": 5, "description": "Avaliação do atendimento (1-5 estrelas)" },
    "rating_comment": { "type": "string", "description": "Comentário sobre a avaliação" }
  },
  "required": ["customer_id", "type", "subject", "description"],
  "rls": {
    "read": {
      "created_by": "{{user.email}}"
    },
    "write": {
      "created_by": "{{user.email}}"
    }
  }
}
Entidade: TicketMessage
{
  "name": "TicketMessage",
  "type": "object",
  "properties": {
    "ticket_id": { "type": "string", "description": "ID do ticket" },
    "sender_id": { "type": "string", "description": "ID do usuário que enviou a mensagem" },
    "sender_type": { "type": "string", "enum": ["customer", "business", "admin"], "description": "Tipo do remetente" },
    "message": { "type": "string", "description": "Conteúdo da mensagem" },
    "attachment_url": { "type": "string", "description": "URL de anexo (imagem, documento, etc.)" },
    "is_internal": { "type": "boolean", "default": false, "description": "Se é uma nota interna (não visível ao cliente)" }
  },
  "required": ["ticket_id", "sender_id", "sender_type", "message"],
  "type": "object"
}
Entidade: PlatformReport
{
  "name": "PlatformReport",
  "type": "object",
  "properties": {
    "reporter_id": { "type": "string", "description": "ID do usuário que fez a denúncia" },
    "reported_team_id": { "type": "string", "description": "ID da empresa denunciada" },
    "reported_user_id": { "type": "string", "description": "ID do usuário denunciado (opcional)" },
    "category": { "type": "string", "enum": ["fraud", "poor_service", "product_quality", "delivery_issues", "overcharging", "harassment", "spam", "other"], "description": "Categoria da denúncia" },
    "severity": { "type": "string", "enum": ["low", "medium", "high", "critical"], "default": "medium", "description": "Gravidade da denúncia" },
    "title": { "type": "string", "description": "Título da denúncia" },
    "description": { "type": "string", "description": "Descrição detalhada da denúncia" },
    "evidence_urls": { "type": "array", "items": { "type": "string" }, "description": "URLs de evidências (fotos, documentos, etc.)" },
    "status": { "type": "string", "enum": ["pending", "investigating", "resolved", "dismissed"], "default": "pending", "description": "Status da investigação" },
    "admin_notes": { "type": "string", "description": "Notas internas dos administradores" },
    "resolution": { "type": "string", "description": "Descrição da resolução" },
    "resolved_at": { "type": "string", "format": "date-time", "description": "Data de resolução" }
  },
  "required": ["reporter_id", "category", "title", "description"],
  "type": "object"
}
Entidade: ProductCostHistory
{
  "name": "ProductCostHistory",
  "type": "object",
  "properties": {
    "product_id": { "type": "string", "description": "ID do produto ao qual este custo se refere" },
    "cost_per_unit": { "type": "number", "description": "O custo do produto por unidade" },
    "effective_date": { "type": "string", "format": "date", "description": "A data a partir da qual este custo é válido" }
  },
  "required": ["product_id", "cost_per_unit", "effective_date"],
  "rls": {
    "read": {
      "created_by": "{{user.email}}"
    },
    "write": {
      "created_by": "{{user.email}}"
    }
  }
}
Entidade: TeamSubscriptionHistory
{
  "name": "TeamSubscriptionHistory",
  "type": "object",
  "properties": {
    "team_id": { "type": "string", "description": "ID da empresa" },
    "plan_id": { "type": "string", "description": "ID do plano" },
    "plan_name": { "type": "string", "description": "Nome do plano no momento da assinatura" },
    "plan_price": { "type": "number", "description": "Preço do plano no momento da assinatura" },
    "start_date": { "type": "string", "format": "date", "description": "Data de início da assinatura deste plano" },
    "end_date": { "type": "string", "format": "date", "description": "Data de fim da assinatura deste plano (null se ainda ativo)" },
    "status": { "type": "string", "enum": ["active", "cancelled", "expired"], "default": "active", "description": "Status da assinatura" },
    "stripe_subscription_id": { "type": "string", "description": "ID da assinatura no Stripe" },
    "invoice_date": { "type": "string", "format": "date", "description": "Data da fatura para este período" },
    "invoice_amount": { "type": "number", "description": "Valor cobrado nesta fatura" },
    "payment_date": { "type": "string", "format": "date", "description": "Data em que o pagamento foi processado" },
    "payment_status": { "type": "string", "enum": ["pending", "paid", "failed", "cancelled"], "default": "pending", "description": "Status do pagamento da fatura" },
    "stripe_invoice_id": { "type": "string", "description": "ID da fatura no Stripe" },
    "stripe_payment_intent_id": { "type": "string", "description": "ID do payment intent no Stripe" },
    "billing_period_start": { "type": "string", "format": "date", "description": "Início do período de cobrança" },
    "billing_period_end": { "type": "string", "format": "date", "description": "Fim do período de cobrança" },
    "notes": { "type": "string", "description": "Observações sobre a fatura ou pagamento" }
  },
  "required": ["team_id", "plan_id", "plan_name", "plan_price", "start_date"]
}
Entidade: TeamChangeHistory
{
  "name": "TeamChangeHistory",
  "type": "object",
  "properties": {
    "team_id": { "type": "string", "description": "ID da empresa que foi alterada" },
    "change_type": { "type": "string", "enum": ["address", "contact"], "description": "Tipo de alteração (endereço ou contato)" },
    "old_data": { "type": "object", "additionalProperties": true, "description": "Dados antes da alteração" },
    "new_data": { "type": "object", "additionalProperties": true, "description": "Dados depois da alteração" },
    "changed_by": { "type": "string", "description": "ID do usuário que realizou a alteração" }
  },
  "required": ["team_id", "change_type", "old_data", "new_data", "changed_by"]
}
