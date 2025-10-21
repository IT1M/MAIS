import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Enums (will be available after prisma generate)
const UserRole = {
    ADMIN: 'ADMIN',
    DATA_ENTRY: 'DATA_ENTRY',
    SUPERVISOR: 'SUPERVISOR',
    MANAGER: 'MANAGER',
    AUDITOR: 'AUDITOR',
} as const;

const Destination = {
    MAIS: 'MAIS',
    FOZAN: 'FOZAN',
} as const;

async function main() {
    console.log('🌱 Starting database seed...');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@mais.sa' },
        update: {},
        create: {
            email: 'admin@mais.sa',
            name: 'System Administrator',
            password: hashedPassword,
            role: UserRole.ADMIN,
            isActive: true,
            preferences: {
                theme: 'light',
                language: 'ar',
                notifications: true,
            },
        },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create sample users
    const dataEntryUser = await prisma.user.upsert({
        where: { email: 'dataentry@mais.sa' },
        update: {},
        create: {
            email: 'dataentry@mais.sa',
            name: 'Data Entry User',
            password: await bcrypt.hash('DataEntry@123', 10),
            role: UserRole.DATA_ENTRY,
            isActive: true,
        },
    });

    const supervisorUser = await prisma.user.upsert({
        where: { email: 'supervisor@mais.sa' },
        update: {},
        create: {
            email: 'supervisor@mais.sa',
            name: 'Supervisor User',
            password: await bcrypt.hash('Supervisor@123', 10),
            role: UserRole.SUPERVISOR,
            isActive: true,
        },
    });

    console.log('✅ Sample users created');

    // Create sample inventory items
    const sampleItems = [
        {
            itemName: 'Surgical Gloves',
            batch: 'SG-2024-001',
            quantity: 5000,
            reject: 50,
            destination: Destination.MAIS,
            category: 'Medical Supplies',
            notes: 'Latex-free surgical gloves, size M',
        },
        {
            itemName: 'Face Masks N95',
            batch: 'FM-2024-002',
            quantity: 10000,
            reject: 100,
            destination: Destination.FOZAN,
            category: 'PPE',
            notes: 'N95 respirator masks for medical staff',
        },
        {
            itemName: 'Syringes 10ml',
            batch: 'SY-2024-003',
            quantity: 15000,
            reject: 75,
            destination: Destination.MAIS,
            category: 'Medical Devices',
            notes: 'Sterile disposable syringes',
        },
        {
            itemName: 'Bandages Sterile',
            batch: 'BD-2024-004',
            quantity: 8000,
            reject: 40,
            destination: Destination.FOZAN,
            category: 'Medical Supplies',
            notes: 'Sterile gauze bandages, various sizes',
        },
        {
            itemName: 'Alcohol Swabs',
            batch: 'AS-2024-005',
            quantity: 20000,
            reject: 200,
            destination: Destination.MAIS,
            category: 'Medical Supplies',
            notes: '70% isopropyl alcohol prep pads',
        },
        {
            itemName: 'Thermometer Digital',
            batch: 'TD-2024-006',
            quantity: 500,
            reject: 5,
            destination: Destination.FOZAN,
            category: 'Medical Devices',
            notes: 'Digital thermometers with disposable covers',
        },
        {
            itemName: 'IV Catheters',
            batch: 'IV-2024-007',
            quantity: 3000,
            reject: 30,
            destination: Destination.MAIS,
            category: 'Medical Devices',
            notes: 'Intravenous catheters, 18G',
        },
        {
            itemName: 'Surgical Masks',
            batch: 'SM-2024-008',
            quantity: 25000,
            reject: 250,
            destination: Destination.FOZAN,
            category: 'PPE',
            notes: 'Disposable 3-ply surgical masks',
        },
    ];

    for (const item of sampleItems) {
        await prisma.inventoryItem.create({
            data: {
                ...item,
                enteredBy: dataEntryUser.id,
            },
        });
    }

    console.log(`✅ Created ${sampleItems.length} sample inventory items`);

    // Create default system settings
    const defaultSettings = [
        {
            key: 'theme.default',
            value: { mode: 'light', primaryColor: '#0070f3' },
            category: 'theme',
            updatedBy: adminUser.id,
        },
        {
            key: 'api.rateLimit',
            value: { requestsPerMinute: 100, burstLimit: 200 },
            category: 'api',
            updatedBy: adminUser.id,
        },
        {
            key: 'notifications.email',
            value: { enabled: true, lowStockThreshold: 100 },
            category: 'notifications',
            updatedBy: adminUser.id,
        },
        {
            key: 'backup.schedule',
            value: { frequency: 'daily', time: '02:00', retention: 30 },
            category: 'backup',
            updatedBy: adminUser.id,
        },
        {
            key: 'reports.autoGenerate',
            value: { monthly: true, yearly: true },
            category: 'reports',
            updatedBy: adminUser.id,
        },
    ];

    for (const setting of defaultSettings) {
        await prisma.systemSettings.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }

    console.log('✅ Created default system settings');

    console.log('🎉 Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
