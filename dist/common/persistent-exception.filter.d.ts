import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { PersistentLogService } from '../kiosk/persistent-log.service';
export declare class PersistentExceptionFilter implements ExceptionFilter {
    private readonly logs;
    constructor(logs: PersistentLogService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
