require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const { TEMPLATE_WELCOME_MAIL, TEMPLATE_RESET_MAIL, TEMPLATE_ADMIN_WELCOME_MAIL } = require('./mail_temp');
const { registermailtoken, forgotmailtoken } = require('../auth/tokencreation');

sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

const sendregisterEmail = async (email, name, type) => {
  try {
    console.log("sendregisterEmail");

    const tokenData = { email, name };
    const token = await registermailtoken(tokenData, type);
    console.log(token);

    const verificationUrl = `${process.env.STATIC_URL}/password?token=${token}#type=register`;

    const htmlContent = type === 'admin'
      ? TEMPLATE_ADMIN_WELCOME_MAIL(name, verificationUrl)
      : TEMPLATE_WELCOME_MAIL(name, verificationUrl);

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // e.g. 'noreply@yourdomain.com'
      subject: 'Linkedin - Verify Your Email and Set Your Password',
      text: `Hello ${name},\n\nWelcome! Click the link below to verify your email and set your password:\n\n${verificationUrl}`,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log("Register email sent successfully ✅");

  } catch (error) {
    console.error("Error sending register email ❌:", error.response?.body || error);
    throw new Error('Error sending register email');
  }
};

const sendforgotEmail = async (email, name) => {
  try {
    console.log("sendforgotEmail");

    const tokenData = { email, name };
    const token = await forgotmailtoken(tokenData);
    console.log(token);

    const verificationUrl = `${process.env.STATIC_URL}/password?token=${token}#type=forgot`;

    const htmlContent = TEMPLATE_RESET_MAIL(name, verificationUrl);

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Linkedin - Reset Your Password',
      text: `Hello ${name},\n\nClick the link below to reset your password:\n\n${verificationUrl}`,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log("Forgot password email sent successfully ✅");

  } catch (error) {
    console.error("Error sending forgot password email ❌:", error.response?.body || error);
    throw new Error('Error sending forgot password email');
  }
};

module.exports = { sendregisterEmail, sendforgotEmail };
