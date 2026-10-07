import type { Employee, PayrollEnvelopeRow, PayrollPeriod, SignedPayrollTransfer } from './contracts';
export declare class PayrollTransferService {
    private keys;
    create(employee: Employee, period: PayrollPeriod, rows: PayrollEnvelopeRow[]): Promise<SignedPayrollTransfer>;
}
