import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { verify } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { buildEscPosReceipt } from '../src/kiosk/escpos-receipt';
import { PayrollTransferService } from '../src/kiosk/payroll-transfer.service';

const period = { consecutive: 216, from: '16/07/2026', to: '31/07/2026', totalRecords: 1 };
const rows = [{ cod_Empleado: 1234, valor: 14649.72, RotDeveng: 'SALARIO BASICO', Valoded: 1025.48, RotDeduc: 'INSS', saldo: 0, nom_empleado: 'ANA', ape_empleado: 'PEREZ', des_cargo: 'ANALISTA', numero_inss: '123456', des_dependencia: 'INFORMATICA', Dias_laborados: 15, cantExtra: 7.5, fechaini: period.from, fechafin: period.to }];

test('genera ticket ESC/POS para la TM-U220', () => {
  const ticket = buildEscPosReceipt(rows, period, { columns: 42, cutPaper: true });
  assert.equal(ticket[0], 0x1b);
  assert.match(ticket.toString('latin1'), /DIAS LABORADOS: 15\.00\nCant Horas Extras: 7\.50/);
  assert.match(ticket.toString('latin1'), /COMPROBANTE DE PAGO/);
  assert.ok(ticket.includes(Buffer.from([0x1d, 0x56, 0x42, 0x00])));
});

test('firma el PDF417 con Ed25519 y permite verificarlo', async () => {
  const folder = mkdtempSync(path.join(os.tmpdir(), 'kiosko-sign-'));
  process.env.KIOSK_SIGNING_KEY_PATH = path.join(folder, 'private.pem');
  process.env.KIOSK_SIGNING_PUBLIC_KEY_PATH = path.join(folder, 'public.pem');
  try {
    const result = await new PayrollTransferService().create({ code: '1234', name: 'ANA PEREZ', photoDataUrl: null, payrollCode: 1 }, period, rows);
    const [, keyId, payload, signature] = result.payload.split('.');
    assert.equal(keyId, result.keyId);
    assert.equal(JSON.parse(Buffer.from(payload, 'base64url').toString()).employee.cantExtra, 7.5);
    assert.equal(signature, result.signature);
    assert.equal(verify(null, Buffer.from(payload), result.publicKey, Buffer.from(signature, 'base64url')), true);
    assert.match(result.barcodeDataUrl, /^data:image\/png;base64,/);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

test('comprime comprobantes grandes sin perder horas extras, conceptos ni firma', async () => {
  const folder = mkdtempSync(path.join(os.tmpdir(), 'kiosko-sign-'));
  const previousPrivate = process.env.KIOSK_SIGNING_KEY_PATH;
  const previousPublic = process.env.KIOSK_SIGNING_PUBLIC_KEY_PATH;
  process.env.KIOSK_SIGNING_KEY_PATH = path.join(folder, 'private.pem');
  process.env.KIOSK_SIGNING_PUBLIC_KEY_PATH = path.join(folder, 'public.pem');
  const labels = ['REEMBOLSO DE ALIMENTACION', 'INCENTIVO ANTIGUEDAD', 'FERIADO LABORADO', 'SEPTIMO DIA', 'SUBSIDIO DE ALIMENTACION', 'HORAS EXTRAS', 'SALARIO BASICO'];
  const details = labels.map(RotDeveng => ({ ...rows[0], RotDeveng }));
  try {
    const result = await new PayrollTransferService().create({ code: '1234', name: 'ANA PEREZ', photoDataUrl: null, payrollCode: 1 }, period, details);
    const [prefix, keyId, payload, signature] = result.payload.split('.');
    assert.equal(prefix, 'SM3');
    assert.equal(keyId, result.keyId);
    const decoded = JSON.parse(inflateSync(Buffer.from(payload, 'base64url')).toString());
    assert.equal(decoded.employee.cantExtra, 7.5);
    assert.deepEqual(decoded.incomes.map((line: { label: string }) => line.label), labels);
    assert.equal(decoded.deductions.length, details.length);
    assert.equal(verify(null, Buffer.from(payload), result.publicKey, Buffer.from(signature, 'base64url')), true);
    assert.match(result.barcodeDataUrl, /^data:image\/png;base64,/);
  } finally {
    if (previousPrivate === undefined) delete process.env.KIOSK_SIGNING_KEY_PATH;
    else process.env.KIOSK_SIGNING_KEY_PATH = previousPrivate;
    if (previousPublic === undefined) delete process.env.KIOSK_SIGNING_PUBLIC_KEY_PATH;
    else process.env.KIOSK_SIGNING_PUBLIC_KEY_PATH = previousPublic;
    rmSync(folder, { recursive: true, force: true });
  }
});
