const bcrypt = require('bcryptjs');

// Usage: node scripts/hash-password.js yourpassword

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument');
  console.log('Usage: node scripts/hash-password.js yourpassword');
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  
  console.log('\n✓ Password hashed successfully!\n');
  console.log('Hashed password:');
  console.log(hash);
  console.log('\nUse this hash in your database or Prisma Studio when creating users.');
  console.log('\nExample SQL:');
  console.log(`INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")`);
  console.log(`VALUES ('admin-001', 'admin@saudimais.com', 'Admin', '${hash}', 'ADMIN', NOW(), NOW());`);
  console.log('');
});
