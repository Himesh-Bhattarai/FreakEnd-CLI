const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const config = require('../config');

const transport = nodemailer.createTransport(config.email.smtp);

if (process.env.NODE_ENV !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${config.app.frontendUrl}/reset-password?token=${token}`;
  const subject = 'Password Reset Request';
  const text = `Dear user,
  
To reset your password, click on this link: ${resetUrl}
  
If you did not request any password resets, then ignore this email.
  
This link will expire in 10 minutes.`;

  const html = `<p>Dear user,</p>

  
<p>To reset your password, click on this link: <a href="${resetUrl}">Reset Password</a></p>
<p>If you did not request any password resets, please ignore this email.</p>
<p>This link will expire in 10 minutes.</p>`;

  await transport.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html
  });
};

const sendPasswordChangedEmail = async (to) => {
  const subject = 'Password Changed Successfully';
  const text = `Dear user,
  
Your password has been successfully changed.
  
If you did not make this change, please contact our support team immediately.`;

  const html = `<p>Dear user,</p>
<p>Your password has been successfully changed.</p>
<p>If you did not make this change, please contact our support team immediately.</p>`;

  await transport.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html
  });
};

module.exports = {
  transport,
  sendPasswordResetEmail,
  sendPasswordChangedEmail
};