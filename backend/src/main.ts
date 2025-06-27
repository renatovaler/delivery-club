import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response } from 'express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Servir arquivos estáticos
  app.use(express.static(join(__dirname, '..', 'public')));

  // Configuração da validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API Backend')
    .setDescription('Documentação da API do sistema')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Expor o endpoint do Swagger JSON
  app.use('/api/docs-json', (req: Request, res: Response) => {
    res.json(document);
  });

  SwaggerModule.setup('api/docs', app, document);

  // Rota para servir o index.html em todas as rotas não encontradas
  app.use('*', (req: Request, res: Response) => {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  // Inicialização do servidor em todas as interfaces
  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  console.log(`Aplicação rodando em http://0.0.0.0:${port}`);
}

bootstrap();
