import type { PayrollEnvelopeRow, PayrollPeriod, ReceiptPrintResult } from './contracts';
export declare class ReceiptPrinterService {
    private resolvePrinter;
    print(rows: PayrollEnvelopeRow[], period: PayrollPeriod): Promise<ReceiptPrintResult>;
}
