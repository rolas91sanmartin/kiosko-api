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
require("dotenv/config");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
const express_2 = require("express");
const path = __importStar(require("node:path"));
const app_module_1 = require("./app.module");
const configuration_1 = require("./configuration");
const persistent_exception_filter_1 = require("./common/persistent-exception.filter");
const persistent_log_service_1 = require("./kiosk/persistent-log.service");
async function bootstrap() {
    (0, configuration_1.loadJsonConfiguration)();
    (0, configuration_1.validateProductionConfiguration)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bodyParser: false });
    app.enableShutdownHooks();
    app.use((0, express_1.json)({ limit: '12mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '12mb' }));
    app.setGlobalPrefix('api');
    app.use('/api/face-assets', (0, express_2.static)(path.resolve(process.cwd(), 'public', 'face'), { immutable: true, maxAge: '1d' }));
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const persistentLogs = app.get(persistent_log_service_1.PersistentLogService);
    app.useGlobalFilters(new persistent_exception_filter_1.PersistentExceptionFilter(persistentLogs));
    app.use((request, response, next) => {
        const started = Date.now();
        response.on('finish', () => void persistentLogs.write('http.request', `${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - started}ms`, response.statusCode >= 500 ? 'error' : 'info').catch(() => undefined));
        next();
    });
    if (process.env.SWAGGER_ENABLED !== 'false') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('Kiosko API')
            .setDescription('API del kiosko móvil para asistencia, pagos, fotografías y reportes.')
            .setVersion('1.0')
            .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: { persistAuthorization: true },
        });
    }
    await app.listen(Number(process.env.PORT || 3000), '0.0.0.0');
}
void bootstrap();
//# sourceMappingURL=main.js.map