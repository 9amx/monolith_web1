import { sendOtpEmail } from './src/lib/mailer.js';
sendOtpEmail('olialkonok2@gmail.com', '123456', 'login')
  .then(res => console.log('Result:', res))
  .catch(err => console.error('Error:', err));
