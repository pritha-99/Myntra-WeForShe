
const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/bharat_onboarding';

console.log(`Connecting to: ${uri}...`);

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Success! MongoDB connection established successfully.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Failed! Could not connect to MongoDB:', err.message);
        process.exit(1);
    });

