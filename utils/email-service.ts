// utils/email-service.ts
import { createClient } from './supabase/component';

interface EmailResponse {
  success: boolean;
  message: string;
  error?: any;
}

export class EmailService {
  private static readonly RATE_LIMIT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_ATTEMPTS = 3;
  private static attempts = new Map<string, { count: number; lastAttempt: number }>();

  private static checkRateLimit(email: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(email);

    if (!userAttempts) {
      this.attempts.set(email, { count: 1, lastAttempt: now });
      return true;
    }

    if (now - userAttempts.lastAttempt > this.RATE_LIMIT_DURATION) {
      this.attempts.set(email, { count: 1, lastAttempt: now });
      return true;
    }

    if (userAttempts.count >= this.MAX_ATTEMPTS) {
      return false;
    }

    this.attempts.set(email, {
      count: userAttempts.count + 1,
      lastAttempt: now
    });
    return true;
  }

  private static getRemainingAttempts(email: string): number {
    const userAttempts = this.attempts.get(email);
    if (!userAttempts) return this.MAX_ATTEMPTS;
    return Math.max(0, this.MAX_ATTEMPTS - userAttempts.count);
  }

  private static getWaitTime(email: string): number {
    const userAttempts = this.attempts.get(email);
    if (!userAttempts) return 0;

    const timeElapsed = Date.now() - userAttempts.lastAttempt;
    const waitTime = Math.max(0, this.RATE_LIMIT_DURATION - timeElapsed);
    return Math.ceil(waitTime / 1000 / 60); // Convert to minutes
  }

  static async sendPasswordReset(email: string): Promise<EmailResponse> {
    try {
      // Check rate limiting
      if (!this.checkRateLimit(email)) {
        const waitTime = this.getWaitTime(email);
        return {
          success: false,
          message: `Too many attempts. Please try again in ${waitTime} minutes.`
        };
      }

      // Validate email format
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      // Validate email domain
      if (!email.endsWith('@student.gmi.edu.my') && !email.endsWith('@gmi.edu.my')) {
        return {
          success: false,
          message: 'Please use a valid GMI email address'
        };
      }

      const supabase = createClient();

      // Check if user exists
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error('Authentication error');
      }

      // Send reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      // Log successful attempt
      await this.logEmailAttempt(email, 'success');

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email'
      };

    } catch (error) {
      // Log failed attempt
      await this.logEmailAttempt(email, 'failed', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        error
      };
    }
  }

  private static async logEmailAttempt(email: string, status: 'success' | 'failed', error?: any) {
    try {
      const supabase = createClient();
      await supabase.from('email_logs').insert({
        email,
        type: 'password_reset',
        status,
        error: error ? JSON.stringify(error) : null,
      });
    } catch (logError) {
      console.error('Failed to log email attempt:', logError);
    }
  }

  static getAttemptsInfo(email: string) {
    return {
      remaining: this.getRemainingAttempts(email),
      waitTime: this.getWaitTime(email)
    };
  }
}