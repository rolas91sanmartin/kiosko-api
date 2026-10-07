"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KioskController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_key_guard_1 = require("../common/api-key.guard");
const basic_auth_guard_1 = require("../common/basic-auth.guard");
const roles_decorator_1 = require("../common/roles.decorator");
const dto_1 = require("./dto");
const kiosk_service_1 = require("./kiosk.service");
const sql_server_repository_1 = require("./sql-server.repository");
const mail_service_1 = require("./mail.service");
const payroll_transfer_service_1 = require("./payroll-transfer.service");
const persistent_log_service_1 = require("./persistent-log.service");
const receipt_printer_service_1 = require("./receipt-printer.service");
const face_engine_1 = require("./face-engine");
let KioskController = class KioskController {
    service;
    repository;
    printer;
    mail;
    transfers;
    logs;
    constructor(service, repository, printer, mail, transfers, logs) {
        this.service = service;
        this.repository = repository;
        this.printer = printer;
        this.mail = mail;
        this.transfers = transfers;
        this.logs = logs;
    }
    rrhhAuth(request) { return { authenticated: true, role: request.admin.role, username: request.admin.username }; }
    tiAdminAuth(request) { return { authenticated: true, role: request.admin.role, username: request.admin.username }; }
    async configuration() {
        const databaseConfigured = Boolean(process.env.KIOSK_DB_PASSWORD && process.env.KIOSK_DB_PASSWORD !== 'CAMBIAR_PASSWORD');
        let ready = databaseConfigured;
        let message = databaseConfigured ? undefined : 'Configure KIOSK_DB_PASSWORD en la API.';
        if (databaseConfigured) {
            try {
                await this.repository.ping();
            }
            catch {
                ready = false;
                message = 'SQL Server no está disponible desde Kiosko API. Revise red, servidor y credenciales.';
            }
        }
        return { ready, message, kiosk: { timezone: process.env.KIOSK_TIMEZONE || 'America/Guatemala', autoRegisterDelayMs: Number(process.env.KIOSK_AUTO_DELAY_MS || 250), confirmationDurationMs: Number(process.env.KIOSK_CONFIRMATION_MS || 1500), faceMatchThreshold: Number(process.env.KIOSK_FACE_THRESHOLD || .52), faceRequiredMatches: Number(process.env.KIOSK_FACE_REQUIRED_MATCHES || 3), receiptPrinterName: process.env.KIOSK_RECEIPT_PRINTER || 'EPSON TM-U220II Receipt', emailEnabled: Boolean(process.env.KIOSK_SMTP_HOST) } };
    }
    lookup(dto) { return this.service.attendanceLookup(dto.barcode); }
    async register(dto) { await this.repository.register(dto.employeeCode, dto.movement); return { ok: true }; }
    authenticate(dto) { return this.service.employee(dto.barcode); }
    payrolls(page = 1, payrollCode) { return this.repository.paymentPayrolls(page, payrollCode); }
    envelope(employeeCode, payrollCode, consecutive) { return this.repository.paymentEnvelope(employeeCode, consecutive, payrollCode); }
    async print(employeeCode, payrollCode, consecutive, dto) {
        const rows = await this.repository.paymentEnvelope(employeeCode, consecutive, payrollCode);
        const result = await this.printer.print(rows, { consecutive, from: dto.from, to: dto.to, totalRecords: 1 });
        await this.logs.write('payment.print', `${employeeCode}:${payrollCode}:${consecutive}`);
        return result;
    }
    async email(employeeCode, payrollCode, consecutive, dto) {
        const rows = await this.repository.paymentEnvelope(employeeCode, consecutive, payrollCode);
        const result = await this.mail.sendReceipt(dto.email, rows, { consecutive, from: dto.from, to: dto.to, totalRecords: 1 });
        await this.logs.write('payment.email', `${employeeCode}:${payrollCode}:${consecutive}:${dto.email}`);
        return result;
    }
    async transfer(employeeCode, payrollCode, consecutive, dto) {
        const [employee, rows] = await Promise.all([this.service.employeeByCode(employeeCode), this.repository.paymentEnvelope(employeeCode, consecutive, payrollCode)]);
        return this.transfers.create(employee, { consecutive, from: dto.from, to: dto.to, totalRecords: 1 }, rows);
    }
    photoAuth(dto) { return this.service.authorizePhoto(dto.barcode); }
    photoSave(dto) { return this.service.savePhoto(dto.token, dto.imageDataUrl); }
    reportPayrolls() { return this.repository.payrolls(); }
    dependencies(dto) { return this.repository.dependencies(dto.codes); }
    employees(dto) { return this.repository.employees(dto); }
    report(dto) { return this.repository.report(dto); }
    logsList(limit = 200) { return this.logs.recent(limit); }
    faceEngine() { return face_engine_1.faceEngineHtml; }
};
exports.KioskController = KioskController;
__decorate([
    (0, common_1.Get)('auth/rrhh'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, roles_decorator_1.AdminRoles)('RRHH'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "rrhhAuth", null);
__decorate([
    (0, common_1.Get)('auth/ti-admin'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, roles_decorator_1.AdminRoles)('TI_ADMIN'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "tiAdminAuth", null);
__decorate([
    (0, common_1.Get)('app/configuration-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "configuration", null);
__decorate([
    (0, common_1.Post)('attendance/lookup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BarcodeDto]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "lookup", null);
__decorate([
    (0, common_1.Post)('attendance/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('payments/authenticate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BarcodeDto]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "authenticate", null);
__decorate([
    (0, common_1.Get)('payments/payrolls'),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('payrollCode', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "payrolls", null);
__decorate([
    (0, common_1.Get)('payments/:employeeCode/:payrollCode/:consecutive/envelope'),
    __param(0, (0, common_1.Param)('employeeCode')),
    __param(1, (0, common_1.Param)('payrollCode', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('consecutive', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "envelope", null);
__decorate([
    (0, common_1.Post)('payments/:employeeCode/:payrollCode/:consecutive/print'),
    __param(0, (0, common_1.Param)('employeeCode')),
    __param(1, (0, common_1.Param)('payrollCode', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('consecutive', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, dto_1.PayrollActionDto]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "print", null);
__decorate([
    (0, common_1.Post)('payments/:employeeCode/:payrollCode/:consecutive/email'),
    __param(0, (0, common_1.Param)('employeeCode')),
    __param(1, (0, common_1.Param)('payrollCode', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('consecutive', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, dto_1.EmailReceiptDto]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "email", null);
__decorate([
    (0, common_1.Post)('payments/:employeeCode/:payrollCode/:consecutive/transfer'),
    __param(0, (0, common_1.Param)('employeeCode')),
    __param(1, (0, common_1.Param)('payrollCode', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('consecutive', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, dto_1.PayrollActionDto]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)('photos/authenticate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BarcodeDto]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "photoAuth", null);
__decorate([
    (0, common_1.Post)('photos/save'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PhotoSaveDto]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "photoSave", null);
__decorate([
    (0, common_1.Get)('reports/payrolls'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, roles_decorator_1.AdminRoles)('RRHH'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "reportPayrolls", null);
__decorate([
    (0, common_1.Post)('reports/dependencies'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, roles_decorator_1.AdminRoles)('RRHH'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CodesDto]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "dependencies", null);
__decorate([
    (0, common_1.Post)('reports/employees'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, roles_decorator_1.AdminRoles)('RRHH'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportFiltersDto]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "employees", null);
__decorate([
    (0, common_1.Post)('reports/generate'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, roles_decorator_1.AdminRoles)('RRHH'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportFiltersDto]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "report", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, roles_decorator_1.AdminRoles)('TI_ADMIN'),
    __param(0, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "logsList", null);
__decorate([
    (0, common_1.Get)('face/engine'),
    (0, common_1.Header)('content-type', 'text/html; charset=utf-8'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KioskController.prototype, "faceEngine", null);
exports.KioskController = KioskController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiTags)('Kiosko'),
    (0, swagger_1.ApiSecurity)('api-key'),
    __metadata("design:paramtypes", [kiosk_service_1.KioskService,
        sql_server_repository_1.SqlServerRepository,
        receipt_printer_service_1.ReceiptPrinterService,
        mail_service_1.MailService,
        payroll_transfer_service_1.PayrollTransferService,
        persistent_log_service_1.PersistentLogService])
], KioskController);
//# sourceMappingURL=kiosk.controller.js.map