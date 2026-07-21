require('dotenv').config();
const mongoose = require('mongoose');
const Seller = require('./src/models/Seller');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bharat_onboarding';

async function main() {
  await mongoose.connect(MONGODB_URI);

  const sellerId = `SLR-TEST-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;

  const seller = await Seller.create({
    sellerId,
    language: 'en',
    status: 'submitted',
    answers: {
      fullName: 'Test Seller',
      phone: '9999999999',
      email: 'test@example.com',
      city: 'Test City',
    },
  });

  const readBack = await Seller.findOne({ sellerId: seller.sellerId }).lean();

  console.log('Inserted sellerId:', sellerId);
  console.log('Read back document:');
  console.log(JSON.stringify(readBack, null, 2));
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });