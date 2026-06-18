const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // If SMTP credentials are not fully defined, print to console as fallback
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('==================================================');
      console.log('📬 [EMAIL NOTIFICATION MOCK - LOG TO CONSOLE]');
      console.log(`To:      ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body:    ${options.text}`);
      if (options.html) {
        console.log(`HTML:    Available (rendered in email)`);
      }
      console.log('==================================================');
      return { message: 'Mock email printed to console successfully' };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Complaint System'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@complaint-system.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    // Do not throw to avoid crashing the response flow if email service has issues
    return { error: error.message };
  }
};

module.exports = { sendEmail };
