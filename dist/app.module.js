"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const health_controller_1 = require("./health.controller");
const api_key_guard_1 = require("./common/api-key.guard");
const basic_auth_guard_1 = require("./common/basic-auth.guard");
const kiosk_controller_1 = require("./kiosk/kiosk.controller");
const kiosk_service_1 = require("./kiosk/kiosk.service");
const photo_service_1 = require("./kiosk/photo.service");
const sql_server_repository_1 = require("./kiosk/sql-server.repository");
const mail_service_1 = require("./kiosk/mail.service");
const payroll_transfer_service_1 = require("./kiosk/payroll-transfer.service");
const persistent_log_service_1 = require("./kiosk/persistent-log.service");
const receipt_printer_service_1 = require("./kiosk/receipt-printer.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot({ isGlobal: true })],
        controllers: [health_controller_1.HealthController, kiosk_controller_1.KioskController],
        providers: [api_key_guard_1.ApiKeyGuard, basic_auth_guard_1.BasicAuthGuard, kiosk_service_1.KioskService, photo_service_1.PhotoService, sql_server_repository_1.SqlServerRepository, mail_service_1.MailService, payroll_transfer_service_1.PayrollTransferService, persistent_log_service_1.PersistentLogService, receipt_printer_service_1.ReceiptPrinterService]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map