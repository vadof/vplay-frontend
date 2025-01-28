export interface IEmailSendingOptions {
  email: string;
  resendToken: string;
  emailsSent: number;
  canResend: boolean;
}
