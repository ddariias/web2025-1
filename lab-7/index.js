require('dotenv').config();

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

console.log('Server will run on port:', PORT);
console.log('MongoDB URL:', MONGO_URL);
