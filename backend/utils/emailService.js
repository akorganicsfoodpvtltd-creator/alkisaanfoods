import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter with proper configuration - DON'T verify immediately
const createTransporter = () => {
  // Check if email credentials exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("⚠️ Email credentials not configured. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // Only for development
    }
  });
};

const transporter = createTransporter();

export const sendOrderConfirmationEmail = async (to, orderData) => {
  try {
    // Check if email is configured
    if (!transporter) {
      console.log("📧 Email not sent - email service not configured");
      return { 
        success: false, 
        error: "Email service not configured",
        skipped: true 
      };
    }

    console.log(`📧 Preparing email for: ${to}`);
    
    const { 
      orderId, 
      customerName, 
      items, 
      totalAmount, 
      shippingAddress, 
      phone, 
      paymentMethod 
    } = orderData;

    // Validate email
    if (!to || !to.includes('@')) {
      throw new Error(`Invalid email address: ${to}`);
    }

    // Generate items list HTML
    const itemsList = items.map(item => 
      `<tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.name || 'Product'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">${item.quantity || 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">PKR ${(item.price || 0).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">PKR ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>`
    ).join('');

    const mailOptions = {
      from: `"Your Store" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .order-badge { display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 8px 20px; border-radius: 50px; font-size: 20px; font-weight: 700; margin-top: 15px; }
            .content { padding: 40px 30px; background: #fff; }
            .order-details { background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin: 25px 0; }
            th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #334155; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
            .total-amount { font-size: 24px; font-weight: 700; color: #059669; text-align: right; }
            .footer { text-align: center; padding: 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Your Order! 🎉</h1>
              <div class="order-badge">${orderId}</div>
            </div>
            <div class="content">
              <h2>Hello ${customerName},</h2>
              <p>Your order has been confirmed and is being processed.</p>
              
              <div class="order-details">
                <h3 style="margin-top: 0;">Order Summary</h3>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p>
                <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
                <p><strong>Phone:</strong> ${phone}</p>
              </div>
              
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              
              <div style="text-align: right; margin-top: 20px;">
                <div style="font-size: 20px;">Total: <span class="total-amount">PKR ${totalAmount.toFixed(2)}</span></div>
                <div style="color: #059669; margin-top: 5px;">Free Shipping</div>
              </div>
            </div>
            <div class="footer">
              <p>Need help? Contact our support team</p>
              <p>© ${new Date().getFullYear()} Your Store. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log(`📤 Sending email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}:`, info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return { success: false, error: error.message };
  }
};