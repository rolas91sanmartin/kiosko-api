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
exports.SqlServerRepository = void 0;
const common_1 = require("@nestjs/common");
const sql = __importStar(require("mssql"));
let SqlServerRepository = class SqlServerRepository {
    pool;
    async connection() {
        if (this.pool?.connected)
            return this.pool;
        this.pool = await new sql.ConnectionPool({
            server: process.env.KIOSK_DB_SERVER || '170.0.1.247',
            database: process.env.KIOSK_DB_NAME || 'RRHH',
            user: process.env.KIOSK_DB_USER || 'sa',
            password: process.env.KIOSK_DB_PASSWORD || '',
            port: Number(process.env.KIOSK_DB_PORT || 1433),
            options: {
                encrypt: process.env.KIOSK_DB_ENCRYPT === 'true',
                trustServerCertificate: process.env.KIOSK_DB_TRUST_CERT !== 'false'
            },
            pool: { min: 0, max: 5, idleTimeoutMillis: 30_000 },
            requestTimeout: 60_000,
            connectionTimeout: 10_000
        }).connect();
        this.pool.on('error', () => { this.pool = undefined; });
        return this.pool;
    }
    async onModuleDestroy() { await this.pool?.close(); }
    async ping() {
        await (await this.connection()).request().query('SELECT 1 AS ok;');
        return true;
    }
    async attendanceProcedure(input) {
        const pool = await this.connection();
        const result = await pool.request()
            .input('Cons_Entrada_Salinda', sql.Int, null)
            .input('Cod_Empleado', sql.VarChar(20), input.employeeCode ?? null)
            .input('Cod_Movimiento', sql.Int, input.movement ?? null)
            .input('Id_Pc', sql.Int, input.pcId ?? null)
            .input('Filtro', sql.VarChar(30), input.filter)
            .execute('sp_Entrada_Salida');
        return (result.recordset ?? []);
    }
    async findEmployee(code) {
        const row = (await this.attendanceProcedure({ employeeCode: code, filter: 'EMPLEADO' }))[0];
        if (!row)
            return null;
        const values = Object.values(row);
        return { code, name: String(values[2] ?? row.Nombre ?? row.Descripcion ?? ''), payrollCode: Number(row.cod_nomina ?? row.Cod_nomina ?? values[0]) };
    }
    async lastMovement(code) {
        const row = (await this.attendanceProcedure({ employeeCode: code, filter: 'MOVIMIENTO' }))[0];
        const value = row ? Number(Object.values(row)[0]) : 0;
        return value === 1 || value === 2 ? value : null;
    }
    async register(code, movement) {
        await this.attendanceProcedure({ employeeCode: code, movement, pcId: Number(process.env.KIOSK_PC_ID || 1), filter: 'INSERT' });
    }
    async updateEmployeePhoto(payrollCode, employeeCode, fileName) {
        const pool = await this.connection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const result = await new sql.Request(transaction)
                .input('CodNomina', sql.Int, payrollCode)
                .input('CodEmpleado', sql.Int, Number(employeeCode))
                .input('Foto', sql.VarChar(100), fileName)
                .query('UPDATE dbo.Empleados SET foto = @Foto WHERE cod_nomina = @CodNomina AND cod_empleado = @CodEmpleado;');
            if ((result.rowsAffected?.[0] ?? 0) !== 1)
                throw new Error('No se encontró un único empleado para actualizar la fotografía.');
            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async paymentPayrolls(page, payrollCode) {
        const safePage = Number.isInteger(page) && page > 0 ? page : 1;
        const pageSize = 5;
        const result = await (await this.connection()).request()
            .input('OpcionOperacion', sql.Int, 4).input('_cCod_nomina', sql.Int, payrollCode)
            .input('_ConsecPlani', sql.Int, 1).input('Pagina', sql.Int, safePage)
            .input('CantidadPorPagina', sql.Int, pageSize).input('tabDeven', sql.VarChar(100), 'mov_devengados')
            .input('tabdeducc', sql.VarChar(100), 'mov_deducciones').execute('Estadisticas');
        const rows = (result.recordset ?? []);
        const totalRecords = Number(rows[0]?.TotalRegistros ?? 0);
        return { periods: rows.map(row => ({ from: String(row.Fecha_Inicial ?? ''), to: String(row.Fecha_Final ?? ''), consecutive: Number(row.consecutivo_pla), totalRecords })).filter(p => Number.isInteger(p.consecutive)), page: safePage, pageSize, totalRecords };
    }
    async paymentEnvelope(employeeCode, consecutive, payrollCode) {
        console.log('Fetching payment envelope for employee:', employeeCode, 'consecutive:', consecutive, 'payrollCode:', payrollCode);
        if (!/^\d{4}$/.test(employeeCode))
            throw new Error('Código de empleado inválido.');
        if (!Number.isInteger(consecutive) || consecutive <= 0)
            throw new Error('Planilla inválida.');
        const result = await (await this.connection()).request()
            .input('_cCod_nomina', sql.Int, payrollCode)
            .input('_ConsecPlani', sql.Int, consecutive)
            .input('tabDeven', sql.VarChar(100), 'Hist_devengados').input('tabdeducc', sql.VarChar(100), 'Hist_deduccion')
            .input('tabhextra', sql.VarChar(100), 'Hist_HorasExtras').input('HorasNoLab', sql.VarChar(100), 'Hist_HoraNoLaborada')
            .input('Subsdio', sql.VarChar(100), 'Hist_Subsidio').input('vcorreo', sql.Int, 0)
            .input('emp', sql.Int, Number(employeeCode)).input('Dependencia', sql.VarChar(sql.MAX), '0')
            .input('sobreDetalle', sql.Int, 1).input('onlyOneEmploye', sql.Bit, true).execute('SobreDevDedDet');
        return (result.recordset ?? []);
    }
    async reportProcedure(filter, values) {
        const result = await (await this.connection()).request()
            .input('FI', sql.VarChar(20), values.from ?? null).input('FF', sql.VarChar(20), values.to ?? null)
            .input('CodNomina', sql.VarChar(sql.MAX), values.payrollCodes?.join(',') || null)
            .input('CodDependencia', sql.VarChar(sql.MAX), values.dependencyCodes?.join(',') || null)
            .input('CodEmpleado', sql.VarChar(sql.MAX), values.search ? `%${values.search.trim()}%` : values.employeeCodes?.join(',') || null)
            .input('Filtro', sql.VarChar(30), filter)
            .query('SET DATEFORMAT DMY; EXEC sp_Entrada_Salida_Report @FI=@FI, @FF=@FF, @CodNomina=@CodNomina, @CodDependencia=@CodDependencia, @CodEmpleado=@CodEmpleado, @Filtro=@Filtro;');
        return (result.recordset ?? []);
    }
    async payrolls() { return (await this.reportProcedure('Load-Nomina', {})).map(this.toCatalog); }
    async dependencies(payrollCodes) { return (await this.reportProcedure('Load-Depen', { payrollCodes })).map(this.toCatalog); }
    async employees(filters) { return (await this.reportProcedure(filters.search ? 'Load-Emple-Like' : 'Load-Emple', filters)).map(row => ({ ...row, Seleccionar: true })); }
    async report(filters) { return this.reportProcedure(filters.includeExitTime ? 'Todo' : 'Entrada', filters); }
    toCatalog(row) { return { code: String(row.Codigo ?? Object.values(row)[0] ?? ''), description: String(row.Descripcion ?? Object.values(row)[1] ?? '') }; }
};
exports.SqlServerRepository = SqlServerRepository;
exports.SqlServerRepository = SqlServerRepository = __decorate([
    (0, common_1.Injectable)()
], SqlServerRepository);
//# sourceMappingURL=sql-server.repository.js.map