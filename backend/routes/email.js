import express from 'express';
import { Resend } from 'resend';

const router = express.Router();

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ success: false, message: 'RESEND_API_KEY not set in environment variables' });
    }
    res.json({
      success: true,
      message: 'Resend email service is configured',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send order confirmation email
router.post('/', async (req, res) => {
  console.log('📧 Email API called at:', new Date().toISOString());

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

    if (!to || !to.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid recipient email is required' });
    }

    if (!customerName || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
            <p>Questions? Contact us at akorganicsfoodpvtltd@gmail.com</p>
            <div class="footer">
              <p>AK Organics Food Pvt Ltd</p>
              <p>© ${new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'AK Organics <onboarding@resend.dev>',
      to: to,
      subject: `Order Confirmation #${orderId} - AK Organics`,
      html: emailHtml,
      text: `Order Confirmation\n\nDear ${customerName},\n\nYour order ${orderId} has been confirmed.\n\nTotal: PKR ${totalAmount}\n\nThank you for choosing AK Organics!`
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log('✅ Order confirmation email sent to:', to);
    res.json({ success: true, message: 'Email sent successfully', messageId: data?.id });

  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send email: ' + error.message });
  }
});

export default router;
