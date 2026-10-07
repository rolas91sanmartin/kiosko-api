import type { Request } from 'express';
import { type AuthenticatedAdmin } from '../common/basic-auth.guard';
import { BarcodeDto, CodesDto, EmailReceiptDto, PayrollActionDto, PhotoSaveDto, RegisterDto, ReportFiltersDto } from './dto';
import { KioskService } from './kiosk.service';
import { SqlServerRepository } from './sql-server.repository';
import { MailService } from './mail.service';
import { PayrollTransferService } from './payroll-transfer.service';
import { PersistentLogService } from './persistent-log.service';
import { ReceiptPrinterService } from './receipt-printer.service';
export declare class KioskController {
    private readonly service;
    private readonly repository;
    private readonly printer;
    private readonly mail;
    private readonly transfers;
    private readonly logs;
    constructor(service: KioskService, repository: SqlServerRepository, printer: ReceiptPrinterService, mail: MailService, transfers: PayrollTransferService, logs: PersistentLogService);
    rrhhAuth(request: Request & {
        admin?: AuthenticatedAdmin;
    }): {
        authenticated: boolean;
        role: import("../common/roles.decorator").AdminRole;
        username: string;
    };
    tiAdminAuth(request: Request & {
        admin?: AuthenticatedAdmin;
    }): {
        authenticated: boolean;
        role: import("../common/roles.decorator").AdminRole;
        username: string;
    };
    configuration(): Promise<{
        ready: boolean;
        message: string | undefined;
        kiosk: {
            timezone: string;
            autoRegisterDelayMs: number;
            confirmationDurationMs: number;
            faceMatchThreshold: number;
            faceRequiredMatches: number;
            receiptPrinterName: string;
            emailEnabled: boolean;
        };
    }>;
    lookup(dto: BarcodeDto): Promise<{
        employee: import("./contracts").Employee;
        nextMovement: import("./contracts").MovementCode;
        nextMovementLabel: string;
    }>;
    register(dto: RegisterDto): Promise<{
        ok: boolean;
    }>;
    authenticate(dto: BarcodeDto): Promise<import("./contracts").Employee>;
    payrolls(page: number | undefined, payrollCode: number): Promise<{
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
    envelope(employeeCode: string, payrollCode: number, consecutive: number): Promise<import("./contracts").PayrollEnvelopeRow[]>;
    print(employeeCode: string, payrollCode: number, consecutive: number, dto: PayrollActionDto): Promise<import("./contracts").ReceiptPrintResult>;
    email(employeeCode: string, payrollCode: number, consecutive: number, dto: EmailReceiptDto): Promise<{
        sent: boolean;
        messageId: string;
    }>;
    transfer(employeeCode: string, payrollCode: number, consecutive: number, dto: PayrollActionDto): Promise<import("./contracts").SignedPayrollTransfer>;
    photoAuth(dto: BarcodeDto): Promise<{
        employee: import("./contracts").Employee;
        token: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    photoSave(dto: PhotoSaveDto): Promise<import("./contracts").Employee>;
    reportPayrolls(): Promise<{
        code: string;
        description: string;
    }[]>;
    dependencies(dto: CodesDto): Promise<{
        code: string;
        description: string;
    }[]>;
    employees(dto: ReportFiltersDto): Promise<{
        Seleccionar: boolean;
    }[]>;
    report(dto: ReportFiltersDto): Promise<{
        [x: string]: unknown;
    }[]>;
    logsList(limit?: number): Promise<import("./persistent-log.service").LogEntry[]>;
    faceEngine(): string;
}
