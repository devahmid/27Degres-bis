import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean); // Remove undefined values

  app.enableCors({
    origin: isDevelopment 
      ? true // Allow all origins in development
      : (origin, callback) => {
          // In production, only allow specific origins
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      skipMissingProperties: false,
      skipNullProperties: true,
      skipUndefinedProperties: true,
      // Allow empty strings to be treated as undefined for optional fields
      stopAtFirstError: false,
    })
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // WebSocket configuration is handled by the gateway
  const port = process.env.PORT || 3000;
  
  try {
    await app.listen(port);
    console.log(`✅ Application is running on: http://localhost:${port}/api`);
  } catch (error: any) {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Le port ${port} est déjà utilisé.`);
      console.log(`💡 Essayez: npm run stop`);
      console.log(`💡 Ou: lsof -ti:${port} | xargs kill -9`);
      process.exit(1);
    } else {
      throw error;
    }
  }
}
bootstrap();

