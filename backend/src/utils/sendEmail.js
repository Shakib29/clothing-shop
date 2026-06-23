const nodemailer = require('nodemailer');

// Check if email credentials are configured
const hasEmailCredentials = (
  process.env.EMAIL_HOST &&
  process.env.EMAIL_HOST !== 'smtp.gmail.com' ||
  (process.env.EMAIL_USER &&
   process.env.EMAIL_USER !== 'your-email@gmail.com' &&
   process.env.EMAIL_PASS &&
   process.env.EMAIL_PASS !== 'your-app-password')
);

let transporter;
if (hasEmailCredentials) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.log('Email credentials not configured. Order confirmation emails will be disabled.');
}

const sendEmail = async (options) => {
  if (!transporter) {
    console.log('Email not sent - no email credentials configured');
    return;
  }

  try {
    const message = {
      from: `${process.env.EMAIL_FROM || 'Clothing Store'} <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(message);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // Don't throw - graceful degradation
  }
};

module.exports = sendEmail;
