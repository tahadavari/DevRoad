import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || "DevRoad <noreply@devroad.ir>",
    to: email,
    subject: "کد تایید ایمیل - DevRoad",
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">DevRoad</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">مسیر یادگیری برنامه‌نویسی</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">تایید ایمیل</h2>
          <p style="color: #4b5563; line-height: 1.8;">سلام! برای تایید ایمیل خود، کد زیر را وارد کنید:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">این کد تا ۱۰ دقیقه معتبر است.</p>
          <p style="color: #6b7280; font-size: 14px;">اگر شما این درخواست را نداده‌اید، لطفا این ایمیل را نادیده بگیرید.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
