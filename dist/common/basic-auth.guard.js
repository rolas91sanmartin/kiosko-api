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
exports.BasicAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const node_crypto_1 = require("node:crypto");
const roles_decorator_1 = require("./roles.decorator");
function safeEqual(left, right) {
    const a = (0, node_crypto_1.createHash)('sha256').update(left).digest();
    const b = (0, node_crypto_1.createHash)('sha256').update(right).digest();
    return (0, node_crypto_1.timingSafeEqual)(a, b);
}
function decodeBasic(header) {
    if (!header?.startsWith('Basic '))
        return null;
    try {
        const decoded = Buffer.from(header.slice(6).trim(), 'base64').toString('utf8');
        const separator = decoded.indexOf(':');
        if (separator < 1)
            return null;
        return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
    }
    catch {
        return null;
    }
}
let BasicAuthGuard = class BasicAuthGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const roles = this.reflector.getAllAndOverride(roles_decorator_1.ADMIN_ROLES_KEY, [context.getHandler(), context.getClass()]) || [];
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const supplied = decodeBasic(request.header('authorization'));
        const accounts = [
            { role: 'RRHH', username: process.env.KIOSK_RRHH_USER || '', password: process.env.KIOSK_RRHH_PASSWORD },
            { role: 'TI_ADMIN', username: process.env.KIOSK_TI_ADMIN_USER || '', password: process.env.KIOSK_TI_ADMIN_PASSWORD }
        ];
        const account = accounts.find(item => item.username && item.password && item.password !== 'CAMBIAR_PASSWORD' && supplied && safeEqual(item.username, supplied.username) && safeEqual(item.password, supplied.password));
        if (!account || (roles.length && !roles.includes(account.role))) {
            response.setHeader('WWW-Authenticate', 'Basic realm="Kiosko API"');
            throw new common_1.UnauthorizedException('Usuario, contraseña incorrecto.');
        }
        request.admin = { username: account.username, role: account.role };
        return true;
    }
};
exports.BasicAuthGuard = BasicAuthGuard;
exports.BasicAuthGuard = BasicAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], BasicAuthGuard);
//# sourceMappingURL=basic-auth.guard.js.map