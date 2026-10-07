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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollTransferService = void 0;
const common_1 = require("@nestjs/common");
const bwipjs = __importStar(require("bwip-js"));
const node_crypto_1 = require("node:crypto");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const node_zlib_1 = require("node:zlib");
const clean = (value) => String(value ?? '').trim();
const amount = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const base64url = (value) => Buffer.from(value).toString('base64url');
const capacityError = (error) => error instanceof Error && /bwipp\.pdf417(?:dataTooLong|insufficientCapacity)/.test(error.message);
let PayrollTransferService = class PayrollTransferService {
    keys() {
        const privatePath = path.resolve(process.env.KIOSK_SIGNING_KEY_PATH || './config/payroll-signing-private.pem');
        const publicPath = path.resolve(process.env.KIOSK_SIGNING_PUBLIC_KEY_PATH || './config/payroll-signing-public.pem');
        if (!fs.existsSync(privatePath) || !fs.existsSync(publicPath)) {
            fs.mkdirSync(path.dirname(privatePath), { recursive: true });
            fs.mkdirSync(path.dirname(publicPath), { recursive: true });
            const pair = (0, node_crypto_1.generateKeyPairSync)('ed25519');
            fs.writeFileSync(privatePath, pair.privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
            fs.writeFileSync(publicPath, pair.publicKey.export({ type: 'spki', format: 'pem' }));
        }
        const privateKey = fs.readFileSync(privatePath, 'utf8');
        const publicKey = fs.readFileSync(publicPath, 'utf8');
        const keyId = (0, node_crypto_1.createHash)('sha256').update(publicKey).digest('hex').slice(0, 16);
        return { privateKey, publicKey, keyId };
    }
    async create(employee, period, rows) {
        if (!rows.length)
            throw new common_1.BadRequestException('El comprobante no contiene información para transferir.');
        const first = rows[0];
        const envelope = {
            v: 2,
            issuedAt: new Date().toISOString(),
            payroll: { consecutive: period.consecutive, from: period.from, to: period.to, receiptNumber: 1 },
            employee: { code: clean(first.cod_Empleado || employee.code), name: `${clean(first.nom_empleado)} ${clean(first.ape_empleado)}`.trim() || employee.name, socialSecurityNumber: clean(first.numero_inss), role: clean(first.des_cargo), area: clean(first.des_dependencia), workedDays: amount(first.Dias_laborados), cantExtra: amount(first.cantExtra) },
            incomes: rows.filter(row => clean(row.RotDeveng) && amount(row.valor) !== 0).map(row => ({ label: clean(row.RotDeveng), amount: amount(row.valor) })),
            deductions: rows.filter(row => clean(row.RotDeduc) && amount(row.Valoded) !== 0).map(row => ({ label: clean(row.RotDeduc), amount: amount(row.Valoded) })),
            debtBalance: rows.reduce((total, row) => total + amount(row.saldo), 0)
        };
        const json = JSON.stringify(envelope);
        const { privateKey, publicKey, keyId } = this.keys();
        for (const prefix of ['SM2', 'SM3']) {
            const payload = base64url(prefix === 'SM2' ? json : (0, node_zlib_1.deflateSync)(json, { level: 9 }));
            const signature = (0, node_crypto_1.sign)(null, Buffer.from(payload), privateKey).toString('base64url');
            const code = `${prefix}.${keyId}.${payload}.${signature}`;
            if (Buffer.byteLength(code) > 2600)
                continue;
            try {
                const png = await bwipjs.toBuffer({ bcid: 'pdf417', text: code, scale: 3, height: 18, paddingwidth: 10, paddingheight: 10, eclevel: 4, fixedeclevel: true });
                return { version: 1, algorithm: 'Ed25519', keyId, payload: code, signature, publicKey, barcodeDataUrl: `data:image/png;base64,${Buffer.from(png).toString('base64')}` };
            }
            catch (error) {
                if (!capacityError(error))
                    throw error;
            }
        }
        throw new common_1.BadRequestException('El comprobante contiene demasiada información para un solo PDF417, incluso comprimido.');
    }
};
exports.PayrollTransferService = PayrollTransferService;
exports.PayrollTransferService = PayrollTransferService = __decorate([
    (0, common_1.Injectable)()
], PayrollTransferService);
//# sourceMappingURL=payroll-transfer.service.js.map