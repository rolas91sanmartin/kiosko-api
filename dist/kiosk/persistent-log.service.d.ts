export interface LogEntry {
    at: string;
    level: 'info' | 'error';
    event: string;
    detail?: string;
}
export declare class PersistentLogService {
    private readonly file;
    write(event: string, detail?: unknown, level?: 'info' | 'error'): Promise<void>;
    recent(limit?: number): Promise<LogEntry[]>;
}
