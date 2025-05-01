require('dotenv').config();
const nodemailer = require('nodemailer');
const {TEMPLATE_WELCOME_MAIL, TEMPLATE_RESET_MAIL ,TEMPLATE_ADMIN_WELCOME_MAIL} = require('./mail_temp');
const {registermailtoken, forgotmailtoken} = require('../auth/tokencreation');  

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, 
  port: process.env.EMAIL_PORT, 
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});


const sendregisterEmail = async (email, name, type) => {
  try {
    console.log("sendregisterEmail")
    const tokenData = { email, name }; 
    const token = await registermailtoken(tokenData, type); 
    console.log(token);

    const verificationUrl = `${process.env.STATIC_URL}/password?token=${token}#type=register`;

    let htmlContent;
    if (type === 'admin') {
      htmlContent = TEMPLATE_ADMIN_WELCOME_MAIL(name, verificationUrl);
    } else {
      htmlContent = TEMPLATE_WELCOME_MAIL(name, verificationUrl);
    }

    const info = await transporter.sendMail({
      from: `"no-reply" <${process.env.EMAIL_USER}>`,
      to: `${email}`,
      subject: `Linkedin - Verify Your Email and Set Your Password`, 
      text: `Hello ${name},\n\nWelcome! Click the link below to verify your email and set your password:\n\n${verificationUrl}`, 
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId); 
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error('Error sending email');
  }
};



const sendforgotEmail = async (email, name) => {
  try {

    const tokenData = { email, name }; 
    console.log("tokenData", tokenData)
    console.log("sendforgotEmail")
    const token = await forgotmailtoken(tokenData); 

    console.log(token);
    const verificationUrl = `${process.env.STATIC_URL}/password?token=${token}#type=forgot`;

    const htmlContent = TEMPLATE_RESET_MAIL(name, verificationUrl);

    const info = await transporter.sendMail({
      from: `"no-reply" <${process.env.EMAIL_USER}>`,
      to: `${email}`,
      subject: `Linkedin - Reset Your Password`, 
      text: `Hello ${name},\n\nWelcome! Click the reset button below to reset your password:\n\n${verificationUrl}`, 
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId); 
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error('Error sending email');
  }
};




// Export the function to send emails
module.exports = { sendregisterEmail, sendforgotEmail};