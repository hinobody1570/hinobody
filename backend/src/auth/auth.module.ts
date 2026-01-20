import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UserModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => {
        const secret =
          configService.get<string>('JWT_SECRET') || 'your-secret-key';
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }) as any,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Register strategies as normal providers so Nest instantiates them
    // (Passport registers a strategy when the provider is instantiated).
    GoogleStrategy,
    AppleStrategy,
    RolesGuard,
  ],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
