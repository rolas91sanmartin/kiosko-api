import { OnModuleDestroy } from '@nestjs/common';
import type { MovementCode, PayrollEnvelopeRow, ReportFilters } from './contracts';
type DbRow = Record<string, unknown>;
export declare class SqlServerRepository implements OnModuleDestroy {
    private pool?;
    private connection;
    onModuleDestroy(): Promise<void>;
    ping(): Promise<boolean>;
    private attendanceProcedure;
    findEmployee(code: string): Promise<{
        code: string;
        name: string;
        payrollCode: number;
    } | null>;
    lastMovement(code: string): Promise<MovementCode | null>;
    register(code: string, movement: MovementCode): Promise<void>;
    updateEmployeePhoto(payrollCode: number, employeeCode: string, fileName: string): Promise<void>;
    paymentPayrolls(page: number, payrollCode: number): Promise<{
        periods: {
            from: string;
            to: string;
            consecutive: number;
            totalRecords: number;
        }[];
        page: number;
        pageSize: number;
        totalRecords: number;
    }>;
    paymentEnvelope(employeeCode: string, consecutive: number, payrollCode: number): Promise<PayrollEnvelopeRow[]>;
    private reportProcedure;
    payrolls(): Promise<{
        code: string;
        description: string;
    }[]>;
    dependencies(payrollCodes: string[]): Promise<{
        code: string;
        description: string;
    }[]>;
    employees(filters: ReportFilters): Promise<{
        Seleccionar: boolean;
    }[]>;
    report(filters: ReportFilters): Promise<DbRow[]>;
    private toCatalog;
}
export {};
