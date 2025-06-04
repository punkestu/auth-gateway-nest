import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RepositoryMysql } from './repository/repository.mysql';
import { REPOSITORY } from './repository/repository.interface';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "secret",
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: REPOSITORY,
      useClass: RepositoryMysql,
    },
    JwtStrategy
  ],
})
export class AuthModule {}
