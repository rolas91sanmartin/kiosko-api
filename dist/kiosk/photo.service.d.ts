import type { Employee } from './contracts';
import { SqlServerRepository } from './sql-server.repository';
export declare class PhotoService {
    private readonly repository;
    constructor(repository: SqlServerRepository);
    private directory;
    read(code: string): Promise<string | null>;
    save(employee: Employee, imageDataUrl: string): Promise<Employee>;
}
