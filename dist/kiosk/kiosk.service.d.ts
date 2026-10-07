import type { Employee, MovementCode } from './contracts';
import { PhotoService } from './photo.service';
import { SqlServerRepository } from './sql-server.repository';
export declare class KioskService {
    private readonly repository;
    private readonly photos;
    private readonly authorizations;
    constructor(repository: SqlServerRepository, photos: PhotoService);
    employeeCode(barcode: string): string;
    employee(barcode: string): Promise<Employee>;
    employeeByCode(code: string): Promise<Employee>;
    attendanceLookup(barcode: string): Promise<{
        employee: Employee;
        nextMovement: MovementCode;
        nextMovementLabel: string;
    }>;
    authorizePhoto(barcode: string): Promise<{
        employee: Employee;
        token: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    savePhoto(token: string, imageDataUrl: string): Promise<Employee>;
}
