"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportFiltersDto = exports.PayrollActionDto = exports.EmailReceiptDto = exports.CodesDto = exports.PhotoSaveDto = exports.PayrollPageDto = exports.RegisterDto = exports.BarcodeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BarcodeDto {
    barcode;
}
exports.BarcodeDto = BarcodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BarcodeDto.prototype, "barcode", void 0);
class RegisterDto {
    employeeCode;
    movement;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "employeeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [1, 2], description: '1 = entrada, 2 = salida' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsIn)([1, 2]),
    __metadata("design:type", Number)
], RegisterDto.prototype, "movement", void 0);
class PayrollPageDto {
    page = 1;
}
exports.PayrollPageDto = PayrollPageDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, minimum: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], PayrollPageDto.prototype, "page", void 0);
class PhotoSaveDto {
    token;
    imageDataUrl;
}
exports.PhotoSaveDto = PhotoSaveDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhotoSaveDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'data:image/jpeg;base64,...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhotoSaveDto.prototype, "imageDataUrl", void 0);
class CodesDto {
    codes;
}
exports.CodesDto = CodesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CodesDto.prototype, "codes", void 0);
class EmailReceiptDto {
    email;
    from;
    to;
}
exports.EmailReceiptDto = EmailReceiptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'empleado@sanmartin.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EmailReceiptDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01/09/2026' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailReceiptDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '15/09/2026' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailReceiptDto.prototype, "to", void 0);
class PayrollActionDto {
    from;
    to;
}
exports.PayrollActionDto = PayrollActionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01/09/2026' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollActionDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '15/09/2026' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollActionDto.prototype, "to", void 0);
class ReportFiltersDto {
    from;
    to;
    payrollCodes;
    dependencyCodes;
    employeeCodes;
    search;
    includeExitTime;
}
exports.ReportFiltersDto = ReportFiltersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01/09/2026' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportFiltersDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '30/09/2026' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportFiltersDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReportFiltersDto.prototype, "payrollCodes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReportFiltersDto.prototype, "dependencyCodes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReportFiltersDto.prototype, "employeeCodes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportFiltersDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReportFiltersDto.prototype, "includeExitTime", void 0);
//# sourceMappingURL=dto.js.map