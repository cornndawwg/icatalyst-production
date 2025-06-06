const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env');
console.log('Checking for .env file at:', envPath);

try {
  const stats = fs.statSync(envPath);
  console.log('.env file exists:', stats.isFile());
  console.log('.env file size:', stats.size, 'bytes');
  console.log('.env file permissions:', stats.mode.toString(8));
  
  const contents = fs.readFileSync(envPath, 'utf8');
  console.log('\n.env file contents (first line):', contents.split('\n')[0]);
} catch (error) {
  console.error('Error checking .env file:', error.message);
} 