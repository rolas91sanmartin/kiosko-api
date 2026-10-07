import type { PayrollEnvelopeRow, PayrollPeriod } from './contracts';
export declare class MailService {
    sendReceipt(email: string, rows: PayrollEnvelopeRow[], period: PayrollPeriod): Promise<{
        sent: boolean;
        messageId: string;
    }>;
}
