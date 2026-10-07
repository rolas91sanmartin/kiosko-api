export type AdminRole = 'RRHH' | 'TI_ADMIN';
export declare const ADMIN_ROLES_KEY = "adminRoles";
export declare const AdminRoles: (...roles: AdminRole[]) => import("@nestjs/common").CustomDecorator<string>;
