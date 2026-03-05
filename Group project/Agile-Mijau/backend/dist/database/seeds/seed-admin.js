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
exports.seedAdmin = seedAdmin;
const data_source_1 = require("../data-source");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const bcrypt = __importStar(require("bcrypt"));
async function seedAdmin(dataSource = data_source_1.AppDataSource) {
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const existingAdmin = await userRepository.findOne({
        where: { email: 'admin@oss.unist.hr' },
    });
    if (existingAdmin) {
        console.log('- Admin already exists');
        return existingAdmin;
    }
    const hashedPassword = await bcrypt.hash('Admin123$', 10);
    const admin = userRepository.create({
        email: 'admin@oss.unist.hr',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: user_role_enum_1.UserRole.ADMIN,
        isActive: true,
    });
    await userRepository.save(admin);
    console.log('✓ Admin created: admin@oss.unist.hr / Admin123$');
    return admin;
}
if (require.main === module) {
    data_source_1.AppDataSource.initialize()
        .then(() => seedAdmin())
        .then(() => data_source_1.AppDataSource.destroy())
        .catch((error) => {
        console.error('Error seeding admin:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed-admin.js.map