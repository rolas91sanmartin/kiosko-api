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
exports.PersistentLogService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
let PersistentLogService = class PersistentLogService {
    file = path.resolve(process.env.KIOSK_LOG_FILE || './logs/kiosko-api.jsonl');
    async write(event, detail, level = 'info') {
        const entry = { at: new Date().toISOString(), level, event, detail: detail instanceof Error ? detail.message : detail ? String(detail).slice(0, 500) : undefined };
        await fs.mkdir(path.dirname(this.file), { recursive: true });
        await fs.appendFile(this.file, `${JSON.stringify(entry)}\n`, 'utf8');
    }
    async recent(limit = 200) {
        try {
            const content = await fs.readFile(this.file, 'utf8');
            return content.trim().split(/\r?\n/).slice(-Math.min(500, Math.max(1, limit))).reverse().map(line => JSON.parse(line));
        }
        catch {
            return [];
        }
    }
};
exports.PersistentLogService = PersistentLogService;
exports.PersistentLogService = PersistentLogService = __decorate([
    (0, common_1.Injectable)()
], PersistentLogService);
//# sourceMappingURL=persistent-log.service.js.map