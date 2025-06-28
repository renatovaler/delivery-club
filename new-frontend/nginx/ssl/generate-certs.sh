#!/bin/bash

# Criar diretório para certificados se não existir
mkdir -p /etc/nginx/ssl

# Gerar chave privada
openssl genrsa -out /etc/nginx/ssl/server.key 2048

# Gerar CSR (Certificate Signing Request)
openssl req -new -key /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.csr -subj "/C=BR/ST=Estado/L=Cidade/O=Organizacao/OU=TI/CN=localhost"

# Gerar certificado auto-assinado
openssl x509 -req -days 365 -in /etc/nginx/ssl/server.csr -signkey /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.crt

# Definir permissões
chmod 600 /etc/nginx/ssl/server.key
chmod 644 /etc/nginx/ssl/server.crt

echo "Certificados SSL gerados com sucesso!"
echo "Arquivos gerados:"
echo "- /etc/nginx/ssl/server.key (Chave privada)"
echo "- /etc/nginx/ssl/server.crt (Certificado)"
echo "- /etc/nginx/ssl/server.csr (Certificate Signing Request)"
