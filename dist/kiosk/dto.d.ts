export declare class BarcodeDto {
    barcode: string;
}
export declare class RegisterDto {
    employeeCode: string;
    movement: 1 | 2;
}
export declare class PayrollPageDto {
    page: number;
}
export declare class PhotoSaveDto {
    token: string;
    imageDataUrl: string;
}
export declare class CodesDto {
    codes: string[];
}
export declare class EmailReceiptDto {
    email: string;
    from: string;
    to: string;
}
export declare class PayrollActionDto {
    from: string;
    to: string;
}
export declare class ReportFiltersDto {
    from: string;
    to: string;
    payrollCodes: string[];
    dependencyCodes: string[];
    employeeCodes?: string[];
    search?: string;
    includeExitTime?: boolean;
}
