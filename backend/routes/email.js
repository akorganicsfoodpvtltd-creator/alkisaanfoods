import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'akorganicsfoodpvtltd@gmail.com',
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // For local development only
    }
  });
};

// Test endpoint to check email configuration
router.get('/test', async (req, res) => {
  try {
    console.log('🔧 Testing email configuration...');
    
    const transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Email server connection verified');
    
    res.json({
      success: true,
      message: 'Email configuration is working',
      emailUser: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration failed',
      error: error.message
    });
  }
});

// Send order confirmation email
router.post('/', async (req, res) => {
  console.log('📧 Email API called at:', new Date().toISOString());
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      to, 
      customerName, 
      orderId, 
      orderDate, 
      items, 
      shippingAddress, 
      phone, 
      totalAmount,
      paymentMethod 
    } = req.body;

    // Validation
    if (!to || !to.includes('@')) {
      console.error('❌ Invalid recipient email:', to);
      return res.status(400).json({ 
        success: false, 
        message: 'Valid recipient email is required' 
      });
    }

    if (!customerName || !orderId) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    console.log(`📤 Preparing to send email to: ${to}`);

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create HTML email template - SIMPLIFIED VERSION
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; padding-top: 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for shopping with AK Organics!</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${customerName}</strong>,</p>
            
            <p>Your order has been confirmed and is being processed.</p>
            
            <div class="order-details">
              <h3>Order Summary</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Order Date:</strong> ${orderDate}</p>
              
              <h4>Items Ordered:</h4>
              ${items.map(item => `
                <div class="item-row">
                  <span>${item.name} (Qty: ${item.quantity})</span>
                  <span>PKR ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="item-row">
                <span>Subtotal</span>
                <span>PKR ${subtotal.toFixed(2)}</span>
              </div>
              
              <div class="item-row">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              
              <div class="item-row total-row">
                <span>Total Amount</span>
                <span>PKR ${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <h3>Shipping Information</h3>
            <p><strong>Address:</strong> ${shippingAddress}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            
            <p>If you have any questions, contact us at akorganicsfoodpvtltd@gmail.com</p>
            
            <div class="footer">
              <p>AK Organics Food Pvt Ltd</p>
              <p>© ${new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create transporter
    const transporter = createTransporter();
    
    // Send email
    const mailOptions = {
      from: `"AK Organics" <${process.env.EMAIL_USER || 'akorganicsfoodpvtltd@gmail.com'}>`,
      to: to,
      subject: `Order Confirmation #${orderId} - AK Organics`,
      html: emailHtml,
      text: `Order Confirmation\n\nDear ${customerName},\n\nYour order ${orderId} has been confirmed.\n\nTotal: PKR ${totalAmount}\n\nThank you for choosing AK Organics!`
    };

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });
    
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message
    });
  }
});

export default router;