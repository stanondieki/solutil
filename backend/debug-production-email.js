// Debug production email configuration
require('dotenv').config();

console.log('🔍 Production Email Configuration Debug\n');

console.log('Environment Variables:');
console.log('================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('USE_REAL_SMTP:', process.env.USE_REAL_SMTP);
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...` : 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (****)' : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'Not set');
console.log('SMTP_PROVIDER:', process.env.SMTP_PROVIDER || 'gmail (default)');
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');

console.log('\nProduction URLs:');
console.log('================================');
const productionUrls = [
  'https://solutilconnect.vercel.app',
  'https://solutilconnect-frontend.vercel.app',
  'https://solutil.vercel.app'
];

productionUrls.forEach(url => {
  console.log(`- ${url}`);
});

console.log('\nEmail Configuration Analysis:');
console.log('================================');

const emailConfig = {
  hasEmailUser: !!process.env.EMAIL_USER,
  hasEmailPass: !!process.env.EMAIL_PASS,
  hasClientUrl: !!process.env.CLIENT_URL,
  useRealSmtp: process.env.USE_REAL_SMTP === 'true',
  isProduction: process.env.NODE_ENV === 'production'
};

console.log(emailConfig);

console.log('\nRecommended Production Environment Variables:');
console.log('================================');
console.log('USE_REAL_SMTP=true');
console.log('EMAIL_USER=your-gmail@gmail.com');
console.log('EMAIL_PASS=your-app-password');
console.log('EMAIL_FROM=noreply@solutil.com');
console.log('EMAIL_FROM_NAME=SolUtil Service');
console.log('CLIENT_URL=https://solutilconnect.vercel.app');
console.log('FRONTEND_URL=https://solutilconnect.vercel.app');
console.log('SMTP_PROVIDER=gmail');

console.log('\nFor live testing, check:');
console.log('================================');
console.log('1. Spam/Promotion folders in Gmail');
console.log('2. Gmail App Password is valid');
console.log('3. 2FA enabled on Gmail account');
console.log('4. Less secure app access (if needed)');
console.log('5. Production deployment environment variables');