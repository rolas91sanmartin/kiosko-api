import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type AdminRole } from './roles.decorator';
export interface AuthenticatedAdmin {
    username: string;
    role: AdminRole;
}
export declare class BasicAuthGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
