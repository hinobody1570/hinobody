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
    {
      provide: GoogleStrategy,
      useFactory: (configService: ConfigService) => {
        const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        // Only create GoogleStrategy if credentials are configured
        if (clientID && clientSecret && clientID !== 'your-google-client-id' && clientSecret !== 'your-google-client-secret') {
          try {
            return new GoogleStrategy(configService);
          } catch (error) {
            console.warn('Google OAuth strategy creation failed:', error.message);
            // Return a dummy object that won't be used
            return { isConfigured: false } as any;
          }
        }
        console.warn('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google login.');
        // Return a dummy object that won't be used
        return { isConfigured: false } as any;
      },
      inject: [ConfigService],
    },
    {
      provide: AppleStrategy,
      useFactory: (configService: ConfigService) => {
        const clientID = configService.get<string>('APPLE_CLIENT_ID');
        // Only create AppleStrategy if credentials are configured
        if (clientID && clientID !== 'your-apple-client-id') {
          return new AppleStrategy(configService);
        }
        console.warn('Apple OAuth credentials not configured. Set APPLE_CLIENT_ID in .env to enable Apple login.');
        // Return a dummy object that won't be used
        return { isConfigured: false } as any;
      },
      inject: [ConfigService],
    },
    RolesGuard,
  ],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
