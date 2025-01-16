import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/responseInterceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log('Server is running');
  });
}
bootstrap();
