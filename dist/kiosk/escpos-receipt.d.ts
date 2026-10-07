import type { PayrollEnvelopeRow, PayrollPeriod } from './contracts';
export interface EscPosReceiptOptions {
    columns: number;
    cutPaper: boolean;
}
export declare function buildEscPosReceipt(rows: PayrollEnvelopeRow[], period: PayrollPeriod, options: EscPosReceiptOptions): Buffer<ArrayBuffer>;
