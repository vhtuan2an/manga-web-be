const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendOTPEmail(toEmail, otp) {
        const mailOptions = {
            from: `"Manga Web" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Mã OTP đặt lại mật khẩu - Manga Web',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Đặt lại mật khẩu</h2>
                    <p style="color: #666; font-size: 16px;">Xin chào,</p>
                    <p style="color: #666; font-size: 16px;">Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Manga Web của mình.</p>
                    <p style="color: #666; font-size: 16px;">Mã OTP của bạn là:</p>
                    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #4CAF50; letter-spacing: 8px; margin: 0; font-size: 36px;">${otp}</h1>
                    </div>
                    <p style="color: #666; font-size: 14px;">Mã này sẽ hết hạn sau <strong>10 phút</strong>.</p>
                    <p style="color: #666; font-size: 14px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">Email này được gửi tự động từ Manga Web. Vui lòng không trả lời.</p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send OTP email');
        }
    }
}

module.exports = new EmailService();
