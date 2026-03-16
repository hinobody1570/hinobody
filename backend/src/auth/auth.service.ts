import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from '../user/dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // First, ensure email is verified – unverified users should go to verification flow
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in',
      );
    }

    // Then, enforce active status for verified accounts
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        language: user.language,
        role: user.role,
        avatar: user.avatar
      },
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp } = verifyEmailDto;
    const user = await this.userService.verifyEmail(email, otp);

    return {
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        language: user.language,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email } = resendOtpDto;

    // Check if user exists
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If the email exists, a new OTP has been sent' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate and save new OTP
    await this.userService.resendOTP(email);

    // Get updated user to get the new OTP
    const updatedUser = await this.userService.findByEmail(email);

    // Send email with new OTP
    if (updatedUser?.emailVerificationOTP) {
      await this.emailService.sendVerificationEmail(
        email,
        updatedUser.emailVerificationOTP,
        updatedUser.nickname,
      );
    }

    return { message: 'If the email exists, a new OTP has been sent' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Generate reset token
    const resetToken = await this.userService.generatePasswordResetToken(email);

    // If user exists, send reset email
    if (resetToken) {
      const user = await this.userService.findByEmail(email);
      if (user) {
        await this.emailService.sendPasswordResetEmail(
          email,
          resetToken,
          user.nickname,
        );
      }
    }

    // Always return success message for security (don't reveal if email exists)
    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    await this.userService.resetPassword(token, newPassword);

    return {
      message: 'Password reset successfully',
    };
  }

  async googleLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException('No user from Google');
    }

    const dbUser = await this.userService.findOrCreateOAuthUser(
      AuthProvider.GOOGLE,
      user.providerId,
      user.email,
      user.firstName,
      user.lastName,
      user.picture,
    );

    return this.generateTokenResponse(dbUser);
  }

  async appleLogin(idToken: string) {
    if (!idToken) {
      throw new BadRequestException('ID token is required');
    }

    // For Apple, we'll validate the token in the controller
    // and pass the decoded user info here
    // This method will be called after token validation
    return { idToken }; // Placeholder, will be updated
  }

  async appleLoginWithUser(userData: any) {
    const dbUser = await this.userService.findOrCreateOAuthUser(
      AuthProvider.APPLE,
      userData.providerId,
      userData.email,
      userData.firstName,
      userData.lastName,
    );

    return this.generateTokenResponse(dbUser);
  }

  private generateTokenResponse(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        language: user.language,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
    };
  }
}
