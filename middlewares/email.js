const nodemailer = require("nodemailer");

async function sendOtpEmail(toEmail, otp) {

    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    let info = await transporter.sendMail({
        from:  `"Piyush" <${process.env.FROM_EMAIL}>`,
        to: toEmail,
        subject: "Your OTP Code",
        html: `<h2>Your OTP is: <strong>${otp}</strong></h2>`
    });

    console.log("OTP email sent:", info.messageId);
    return true;
}

module.exports = sendOtpEmail;
