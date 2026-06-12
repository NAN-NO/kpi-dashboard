const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Opening SQLite database...');
  const db = new Database('./prisma/dev.db', { readonly: true });
  
  const sqliteDepts = db.prepare('SELECT * FROM "Department"').all();
  const sqliteInds = db.prepare('SELECT * FROM "Indicator"').all();
  const sqliteData = db.prepare('SELECT * FROM "MonthlyData"').all();
  
  let sqliteUsers = [];
  try {
    sqliteUsers = db.prepare('SELECT * FROM "User"').all();
  } catch (e) {
    console.log('No User table in SQLite DB, will create default admin.');
  }

  console.log(`Found ${sqliteDepts.length} depts, ${sqliteInds.length} inds, ${sqliteData.length} data.`);

  console.log('Clearing Postgres database...');
  // Delete all records from Postgres first
  await prisma.monthlyData.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  console.log('Importing Users...');
  for (const u of sqliteUsers) {
    await prisma.user.create({
      data: {
        id: u.id,
        username: u.username,
        password: u.password,
        name: u.name,
        role: u.role,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt)
      }
    });
  }
  
  // If no user, create default admin
  if (sqliteUsers.length === 0) {
    const hashedPassword = await bcrypt.hash('password', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin'
      }
    });
  }

  console.log('Importing Departments...');
  for (const d of sqliteDepts) {
    await prisma.department.create({
      data: {
        id: d.id,
        name: d.name,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt)
      }
    });
  }

  console.log('Importing Indicators...');
  for (const ind of sqliteInds) {
    await prisma.indicator.create({
      data: {
        id: ind.id,
        name: ind.name,
        targetValue: ind.targetValue,
        targetType: ind.targetType,
        unit: ind.unit,
        departmentId: ind.departmentId,
        createdAt: new Date(ind.createdAt),
        updatedAt: new Date(ind.updatedAt)
      }
    });
  }

  console.log('Importing MonthlyData...');
  for (const m of sqliteData) {
    await prisma.monthlyData.create({
      data: {
        id: m.id,
        indicatorId: m.indicatorId,
        year: m.year,
        month: m.month,
        numerator: m.numerator,
        denominator: m.denominator,
        result: m.result,
        isPass: m.isPass === 1 ? true : m.isPass === 0 ? false : null,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt)
      }
    });
  }

  console.log('Migration from SQLite to Postgres completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
