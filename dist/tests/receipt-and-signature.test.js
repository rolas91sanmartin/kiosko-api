"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_test_1 = __importDefault(require("node:test"));
const node_crypto_1 = require("node:crypto");
const escpos_receipt_1 = require("../src/kiosk/escpos-receipt");
const payroll_transfer_service_1 = require("../src/kiosk/payroll-transfer.service");
const period = { consecutive: 216, from: '16/07/2026', to: '31/07/2026', totalRecords: 1 };
const rows = [{ cod_Empleado: 1234, valor: 14649.72, RotDeveng: 'SALARIO BASICO', Valoded: 1025.48, RotDeduc: 'INSS', saldo: 0, nom_empleado: 'ANA', ape_empleado: 'PEREZ', des_cargo: 'ANALISTA', numero_inss: '123456', des_dependencia: 'INFORMATICA', Dias_laborados: 15, fechaini: period.from, fechafin: period.to }];
(0, node_test_1.default)('genera ticket ESC/POS para la TM-U220', () => {
    const ticket = (0, escpos_receipt_1.buildEscPosReceipt)(rows, period, { columns: 42, cutPaper: true });
    strict_1.default.equal(ticket[0], 0x1b);
    strict_1.default.match(ticket.toString('latin1'), /COMPROBANTE DE PAGO/);
    strict_1.default.ok(ticket.includes(Buffer.from([0x1d, 0x56, 0x42, 0x00])));
});
(0, node_test_1.default)('firma el PDF417 con Ed25519 y permite verificarlo', async () => {
    const folder = (0, node_fs_1.mkdtempSync)(node_path_1.default.join(node_os_1.default.tmpdir(), 'kiosko-sign-'));
    process.env.KIOSK_SIGNING_KEY_PATH = node_path_1.default.join(folder, 'private.pem');
    process.env.KIOSK_SIGNING_PUBLIC_KEY_PATH = node_path_1.default.join(folder, 'public.pem');
    try {
        const result = await new payroll_transfer_service_1.PayrollTransferService().create({ code: '1234', name: 'ANA PEREZ', photoDataUrl: null, payrollCode: 1 }, period, rows);
        const [, keyId, payload, signature] = result.payload.split('.');
        strict_1.default.equal(keyId, result.keyId);
        strict_1.default.equal(signature, result.signature);
        strict_1.default.equal((0, node_crypto_1.verify)(null, Buffer.from(payload), result.publicKey, Buffer.from(signature, 'base64url')), true);
        strict_1.default.match(result.barcodeDataUrl, /^data:image\/png;base64,/);
    }
    finally {
        (0, node_fs_1.rmSync)(folder, { recursive: true, force: true });
    }
});
//# sourceMappingURL=receipt-and-signature.test.js.map