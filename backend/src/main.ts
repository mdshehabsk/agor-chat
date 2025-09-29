import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService first
  const configService = app.get(ConfigService);

  // Enable CORS with correct options
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`Server is running on http://localhost:${port}`);
}

void bootstrap();
