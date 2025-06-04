import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST || '127.0.0.1',
        port: process.env.EMAIL_PORT || 1025,
        secure: process.env.EMAIL_SECURE || false,
        auth: {
          user: process.env.EMAIL_USER || 'your@email.com',
          pass: process.env.EMAIL_PASS || 'yourpassword',
        },
      },
      defaults: {
        from: process.env.EMAIL_FROM || '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, '..', 'templates'),
        adapter: new HandlebarsAdapter(), // or EjsAdapter
        options: {
          strict: true,
        },
      },
    }),
  ]
})
export class MailModule {}
