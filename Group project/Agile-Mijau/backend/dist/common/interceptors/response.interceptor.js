"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data === null || data === undefined) {
                const request = context.switchToHttp().getRequest();
                const path = request.url;
                if (this.isListEndpoint(path)) {
                    return {
                        items: [],
                        meta: {
                            total: 0,
                            page: 1,
                            limit: 20,
                            totalPages: 0,
                        },
                    };
                }
                return null;
            }
            if (Array.isArray(data)) {
                return {
                    items: data,
                    meta: {
                        total: data.length,
                        page: 1,
                        limit: data.length,
                        totalPages: 1,
                    },
                };
            }
            if (data.items !== undefined && !data.meta) {
                return {
                    ...data,
                    meta: {
                        total: data.items.length,
                        page: 1,
                        limit: data.items.length,
                        totalPages: 1,
                    },
                };
            }
            return data;
        }));
    }
    isListEndpoint(path) {
        const listPatterns = [
            /\/api\/[^/]+$/,
            /\/api\/admin\/[^/]+$/,
            /\/api\/students\/me\/[^/]+$/,
        ];
        return listPatterns.some((pattern) => pattern.test(path));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map