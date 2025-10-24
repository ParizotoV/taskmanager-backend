import { DocumentBuilder } from '@nestjs/swagger'

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Backend API')
  .setVersion('1.0.0')
  .addServer('http://localhost:4006', 'Servidor de Desenvolvimento')
  .build()

export const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  customSiteTitle: 'Documentação API - Backend',
  customJs: [
    'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js',
    'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js',
  ],
}
