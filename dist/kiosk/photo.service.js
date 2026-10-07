"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const sql_server_repository_1 = require("./sql-server.repository");
async function exists(file) { try {
    await fs.access(file);
    return true;
}
catch {
    return false;
} }
let PhotoService = class PhotoService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    directory() { return path.resolve(process.env.KIOSK_PHOTO_DIRECTORY || './photos'); }
    async read(code) {
        const candidates = [`${Number(code)}.JPG`, `${Number(code)}.jpg`];
        for (const candidate of candidates) {
            try {
                const bytes = await fs.readFile(path.join(this.directory(), candidate));
                return `data:image/jpeg;base64,${bytes.toString('base64')}`;
            }
            catch { }
        }
        return null;
    }
    async save(employee, imageDataUrl) {
        const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(imageDataUrl);
        if (!match)
            throw new common_1.BadRequestException('La captura debe ser una imagen JPEG válida.');
        const bytes = Buffer.from(match[1], 'base64');
        if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff)
            throw new common_1.BadRequestException('La fotografía JPEG no es válida.');
        if (bytes.length > 10 * 1024 * 1024)
            throw new common_1.BadRequestException('La fotografía supera el máximo de 10 MB.');
        const directory = this.directory();
        await fs.mkdir(directory, { recursive: true });
        const fileName = `${Number(employee.code)}.JPG`;
        const target = path.join(directory, fileName);
        const id = (0, node_crypto_1.randomUUID)();
        const temporary = path.join(directory, `.${fileName}.${id}.tmp`);
        const backup = path.join(directory, `.${fileName}.${id}.bak`);
        let originalMoved = false;
        let installed = false;
        try {
            await fs.writeFile(temporary, bytes, { flag: 'wx' });
            if (await exists(target)) {
                await fs.rename(target, backup);
                originalMoved = true;
            }
            await fs.rename(temporary, target);
            installed = true;
            await this.repository.updateEmployeePhoto(employee.payrollCode, employee.code, fileName);
        }
        catch (error) {
            if (installed)
                await fs.rm(target, { force: true }).catch(() => undefined);
            if (originalMoved)
                await fs.rename(backup, target).catch(() => undefined);
            await fs.rm(temporary, { force: true }).catch(() => undefined);
            throw error;
        }
        if (originalMoved)
            await fs.rm(backup, { force: true }).catch(() => undefined);
        return { ...employee, photoDataUrl: `data:image/jpeg;base64,${bytes.toString('base64')}` };
    }
};
exports.PhotoService = PhotoService;
exports.PhotoService = PhotoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sql_server_repository_1.SqlServerRepository])
], PhotoService);
//# sourceMappingURL=photo.service.js.map