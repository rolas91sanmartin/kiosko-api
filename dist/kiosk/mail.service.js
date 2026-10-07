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
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const text = (value) => String(value ?? '').trim();
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const money = (value) => new Intl.NumberFormat('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const escape = (value) => text(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
function receiptHtml(rows, period) {
    const first = rows[0];
    const incomes = rows.filter(row => text(row.RotDeveng) && number(row.valor) !== 0);
    const deductions = rows.filter(row => text(row.RotDeduc) && number(row.Valoded) !== 0);
    const totalIncome = incomes.reduce((sum, row) => sum + number(row.valor), 0);
    const totalDeductions = deductions.reduce((sum, row) => sum + number(row.Valoded), 0);
    const lines = (items, label, amount) => items.map(row => `<tr><td>${escape(row[label])}</td><td style="text-align:right">${money(number(row[amount]))}</td></tr>`).join('');
    return `<div style="font-family:Arial;max-width:760px;margin:auto"><h2>INDUSTRIAL COMERCIAL SAN MARTÍN</h2><p>Planilla del ${escape(period.from)} al ${escape(period.to)}</p><p><b>Empleado:</b> ${escape(first.cod_Empleado)} ${escape(first.nom_empleado)} ${escape(first.ape_empleado)}<br><b>INSS:</b> ${escape(first.numero_inss)}<br><b>Cargo:</b> ${escape(first.des_cargo)} · <b>Área:</b> ${escape(first.des_dependencia)}</p><h3>Ingresos</h3><table style="width:100%">${lines(incomes, 'RotDeveng', 'valor')}</table><p><b>Total ingresos: ${money(totalIncome)}</b></p><h3>Deducciones</h3><table style="width:100%">${lines(deductions, 'RotDeduc', 'Valoded')}</table><p><b>Total deducciones: ${money(totalDeductions)} · Ingreso neto: ${money(totalIncome - totalDeductions)}</b></p></div>`;
}
let MailService = class MailService {
    async sendReceipt(email, rows, period) {
        const host = process.env.KIOSK_SMTP_HOST;
        if (!host)
            throw new Error('Configure KIOSK_SMTP_HOST para habilitar el envío por correo.');
        const transporter = nodemailer.createTransport({
            host,
            port: Number(process.env.KIOSK_SMTP_PORT || 587),
            secure: process.env.KIOSK_SMTP_SECURE === 'true',
            auth: process.env.KIOSK_SMTP_USER ? { user: process.env.KIOSK_SMTP_USER, pass: process.env.KIOSK_SMTP_PASSWORD || '' } : undefined
        });
        const info = await transporter.sendMail({
            from: process.env.KIOSK_SMTP_FROM || process.env.KIOSK_SMTP_USER,
            to: email,
            subject: `Comprobante de pago - Planilla ${period.consecutive}`,
            html: receiptHtml(rows, period)
        });
        return { sent: true, messageId: info.messageId };
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map