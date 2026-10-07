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
exports.KioskService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const photo_service_1 = require("./photo.service");
const sql_server_repository_1 = require("./sql-server.repository");
let KioskService = class KioskService {
    repository;
    photos;
    authorizations = new Map();
    constructor(repository, photos) {
        this.repository = repository;
        this.photos = photos;
    }
    employeeCode(barcode) {
        const normalized = barcode.trim();
        if (normalized.length < 5)
            throw new common_1.BadRequestException('El código de barra no tiene el formato esperado.');
        const code = normalized.substring(1, 5);
        if (!/^\d{4}$/.test(code))
            throw new common_1.BadRequestException('El código de empleado no es válido.');
        return code;
    }
    async employee(barcode) {
        const code = this.employeeCode(barcode);
        return this.employeeByCode(code);
    }
    async employeeByCode(code) {
        const employee = await this.repository.findEmployee(code);
        if (!employee)
            throw new common_1.NotFoundException('Empleado no encontrado');
        return { ...employee, photoDataUrl: await this.photos.read(code) };
    }
    async attendanceLookup(barcode) {
        const employee = await this.employee(barcode);
        const lastMovement = await this.repository.lastMovement(employee.code);
        const nextMovement = lastMovement === 1 ? 2 : 1;
        return { employee, nextMovement, nextMovementLabel: nextMovement === 1 ? 'Entrada' : 'Salida' };
    }
    async authorizePhoto(barcode) {
        const employee = await this.employee(barcode);
        const token = (0, node_crypto_1.randomUUID)();
        this.authorizations.set(token, { employee, expiresAt: Date.now() + 2 * 60_000 });
        return { employee, token };
    }
    async savePhoto(token, imageDataUrl) {
        const authorization = this.authorizations.get(token);
        this.authorizations.delete(token);
        if (!authorization || authorization.expiresAt < Date.now())
            throw new common_1.BadRequestException('La autorización venció. Escanee nuevamente el carnet.');
        return this.photos.save(authorization.employee, imageDataUrl);
    }
};
exports.KioskService = KioskService;
exports.KioskService = KioskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sql_server_repository_1.SqlServerRepository, photo_service_1.PhotoService])
], KioskService);
//# sourceMappingURL=kiosk.service.js.map