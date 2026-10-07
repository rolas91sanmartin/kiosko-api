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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const persistent_log_service_1 = require("../kiosk/persistent-log.service");
let PersistentExceptionFilter = class PersistentExceptionFilter {
    logs;
    constructor(logs) {
        this.logs = logs;
    }
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const detail = exception instanceof Error ? `${exception.name}: ${exception.message}` : String(exception);
        void this.logs.write('http.exception', detail, 'error').catch(() => undefined);
        const body = exception instanceof common_1.HttpException ? exception.getResponse() : { statusCode: status, message: 'Internal server error' };
        response.status(status).json(typeof body === 'string' ? { statusCode: status, message: body } : body);
    }
};
exports.PersistentExceptionFilter = PersistentExceptionFilter;
exports.PersistentExceptionFilter = PersistentExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [persistent_log_service_1.PersistentLogService])
], PersistentExceptionFilter);
//# sourceMappingURL=persistent-exception.filter.js.map