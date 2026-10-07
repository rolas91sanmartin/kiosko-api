"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptPrinterService = void 0;
const common_1 = require("@nestjs/common");
const node_child_process_1 = require("node:child_process");
const escpos_receipt_1 = require("./escpos-receipt");
const windows_raw_printer_1 = require("./windows-raw-printer");
function powershell(script) {
    const encoded = Buffer.from(script, 'utf16le').toString('base64');
    return new Promise((resolve, reject) => {
        (0, node_child_process_1.execFile)('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', encoded], {
            windowsHide: true, timeout: 15_000, maxBuffer: 512 * 1024
        }, (error, stdout, stderr) => error ? reject(new Error(stderr.trim() || error.message)) : resolve(stdout));
    });
}
let ReceiptPrinterService = class ReceiptPrinterService {
    async resolvePrinter() {
        if (process.platform !== 'win32')
            throw new Error('La impresión RAW requiere que kiosko-api se ejecute en Windows.');
        const configured = (process.env.KIOSK_RECEIPT_PRINTER || 'EPSON TM-U220II Receipt').trim();
        const model = (process.env.KIOSK_RECEIPT_MODEL || 'TM-U220').trim().toLowerCase();
        const output = await powershell("Get-Printer | Select-Object -ExpandProperty Name | ConvertTo-Json -Compress");
        const parsed = JSON.parse(output.trim() || '[]');
        const printers = Array.isArray(parsed) ? parsed : [parsed];
        const exact = printers.find(name => name.toLowerCase() === configured.toLowerCase());
        if (exact)
            return exact;
        const matches = printers.filter(name => name.toLowerCase().includes(model));
        if (matches.length === 1)
            return matches[0];
        throw new Error(`No se encontró la impresora '${configured}'. Disponibles: ${printers.join(', ') || 'ninguna'}.`);
    }
    async print(rows, period) {
        const printerName = await this.resolvePrinter();
        const width = Number(process.env.KIOSK_RECEIPT_WIDTH_MM || 76);
        const columns = width >= 76 ? 42 : width >= 69 ? 38 : 32;
        const payload = (0, escpos_receipt_1.buildEscPosReceipt)(rows, period, {
            columns,
            cutPaper: process.env.KIOSK_RECEIPT_RAW_CUT !== 'false'
        });
        await (0, windows_raw_printer_1.printWindowsRaw)(printerName, payload);
        return { printed: true, printerName };
    }
};
exports.ReceiptPrinterService = ReceiptPrinterService;
exports.ReceiptPrinterService = ReceiptPrinterService = __decorate([
    (0, common_1.Injectable)()
], ReceiptPrinterService);
//# sourceMappingURL=receipt-printer.service.js.map