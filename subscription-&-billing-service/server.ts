import express from 'express';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import PDFDocument from 'pdfkit';

const app = express();
const PORT = 3000;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-02-25.clover',
});

// Initialize SQLite Database
const db = new Database('billing.db');

// Setup Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    stripe_customer_id TEXT,
    subscription_status TEXT
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT,
    price INTEGER,
    interval TEXT,
    stripe_price_id TEXT
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    plan_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT,
    current_period_start INTEGER,
    current_period_end INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(plan_id) REFERENCES plans(id)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    subscription_id TEXT,
    stripe_invoice_id TEXT,
    amount_paid INTEGER,
    status TEXT,
    created_at INTEGER,
    invoice_pdf TEXT,
    pdf_data BLOB,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(subscription_id) REFERENCES subscriptions(id)
  );
`);

// Seed some plans if they don't exist
const seedPlans = () => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM plans');
  const { count } = stmt.get() as { count: number };
  if (count === 0) {
    const insert = db.prepare('INSERT INTO plans (id, name, price, interval, stripe_price_id) VALUES (?, ?, ?, ?, ?)');
    insert.run('plan_monthly', 'Pro Monthly', 1500, 'month', 'price_monthly_mock');
    insert.run('plan_yearly', 'Pro Yearly', 15000, 'year', 'price_yearly_mock');
  }
};
seedPlans();

// Middleware for raw body parsing (needed for Stripe Webhooks)
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Helper to generate PDF
function generateInvoicePdf(invoiceData: any, user: any, plan: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(20).text('INVOICE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice ID: ${invoiceData.id}`);
      doc.text(`Date: ${new Date(invoiceData.created_at * 1000).toLocaleDateString()}`);
      doc.text(`Customer: ${user.email}`);
      doc.moveDown();
      doc.text(`Plan: ${plan ? plan.name : 'Subscription'}`);
      doc.text(`Amount Paid: $${(invoiceData.amount_paid / 100).toFixed(2)}`);
      doc.text(`Status: ${invoiceData.status.toUpperCase()}`);
      
      doc.moveDown(2);
      doc.fontSize(10).fillColor('gray').text('Thank you for your business!', { align: 'center' });
      
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// --- API Routes ---

// 1. Subscribe
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, planId } = req.body;
    if (!email || !planId) {
      return res.status(400).json({ error: 'Email and planId are required' });
    }

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId) as any;
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Get or Create User
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      const userId = uuidv4();
      
      // Create Stripe Customer
      let stripeCustomerId = 'cus_mock_' + userId;
      if (process.env.STRIPE_SECRET_KEY) {
        const customer = await stripe.customers.create({ email });
        stripeCustomerId = customer.id;
      }

      db.prepare('INSERT INTO users (id, email, stripe_customer_id, subscription_status) VALUES (?, ?, ?, ?)').run(
        userId, email, stripeCustomerId, 'inactive'
      );
      user = { id: userId, email, stripe_customer_id: stripeCustomerId, subscription_status: 'inactive' };
    }

    // Create Stripe Subscription
    let clientSecret = null;
    let stripeSubscriptionId = 'sub_mock_' + uuidv4();
    
    if (process.env.STRIPE_SECRET_KEY) {
      const subscription = await stripe.subscriptions.create({
        customer: user.stripe_customer_id,
        items: [{ price: plan.stripe_price_id }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      stripeSubscriptionId = subscription.id;
      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice.payment_intent as any;
      clientSecret = paymentIntent?.client_secret;
    } else {
      // Mock client secret for testing without Stripe key
      clientSecret = 'pi_mock_secret';
    }

    // Save Subscription to DB
    const subId = uuidv4();
    db.prepare(`
      INSERT INTO subscriptions (id, user_id, plan_id, stripe_subscription_id, status, current_period_start, current_period_end)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      subId, user.id, plan.id, stripeSubscriptionId, 'incomplete', Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
    );

    res.json({
      subscriptionId: subId,
      clientSecret,
      status: 'incomplete',
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Get Subscription
app.get('/api/subscription', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });

  const subscription = db.prepare(`
    SELECT s.*, p.name as plan_name, p.interval as plan_interval 
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.user_id = ?
    ORDER BY s.current_period_end DESC LIMIT 1
  `).get(user.id);

  res.json({ subscription });
});

// 3. Webhook
app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // Mock event for testing
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as any;
      const stripeSubId = invoice.subscription as string;
      
      // Update subscription status
      db.prepare('UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?').run('active', stripeSubId);
      
      // Get subscription to link invoice
      const sub = db.prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?').get(stripeSubId) as any;
      if (sub) {
        db.prepare('UPDATE users SET subscription_status = ? WHERE id = ?').run('active', sub.user_id);
        
        // Generate PDF
        const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(sub.plan_id) as any;
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sub.user_id) as any;
        
        const invoiceId = uuidv4();
        const invoiceData = {
          id: invoiceId,
          amount_paid: invoice.amount_paid,
          status: 'paid',
          created_at: invoice.created
        };
        
        let pdfBuffer = null;
        try {
          pdfBuffer = await generateInvoicePdf(invoiceData, user, plan);
        } catch (err) {
          console.error('Failed to generate PDF', err);
        }

        // Save invoice
        db.prepare(`
          INSERT INTO invoices (id, user_id, subscription_id, stripe_invoice_id, amount_paid, status, created_at, invoice_pdf, pdf_data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          invoiceId, sub.user_id, sub.id, invoice.id, invoice.amount_paid, 'paid', invoice.created, invoice.hosted_invoice_url || '', pdfBuffer
        );
      }
      break;
    }
    case 'invoice.payment_failed': {
      const failedInvoice = event.data.object as any;
      const failedSubId = failedInvoice.subscription as string;
      db.prepare('UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?').run('past_due', failedSubId);
      
      const failedSub = db.prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?').get(failedSubId) as any;
      if (failedSub) {
        db.prepare('UPDATE users SET subscription_status = ? WHERE id = ?').run('past_due', failedSub.user_id);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const deletedSub = event.data.object as Stripe.Subscription;
      db.prepare('UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?').run('canceled', deletedSub.id);
      
      const canceledSub = db.prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?').get(deletedSub.id) as any;
      if (canceledSub) {
        db.prepare('UPDATE users SET subscription_status = ? WHERE id = ?').run('canceled', canceledSub.user_id);
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});

// 4. Get Invoices
app.get('/api/invoices', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Exclude pdf_data from the list response to save bandwidth
  const invoices = db.prepare('SELECT id, user_id, subscription_id, stripe_invoice_id, amount_paid, status, created_at, invoice_pdf FROM invoices WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  res.json({ invoices });
});

// 4b. Download Invoice PDF
app.get('/api/invoices/:id/download', (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id) as any;
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (!invoice.pdf_data) return res.status(404).json({ error: 'PDF not available for this invoice' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.id}.pdf"`);
  res.send(invoice.pdf_data);
});

// 5. Get Plans
app.get('/api/plans', (req, res) => {
  const plans = db.prepare('SELECT * FROM plans').all();
  res.json({ plans });
});

// Mock Webhook Trigger (for testing without Stripe)
app.post('/api/mock-payment', (req, res) => {
  const { subscriptionId, success } = req.body;
  if (!subscriptionId) return res.status(400).json({ error: 'subscriptionId required' });

  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subscriptionId) as any;
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  const eventType = success ? 'invoice.payment_succeeded' : 'invoice.payment_failed';
  
  const mockEvent = {
    type: eventType,
    data: {
      object: {
        id: 'in_mock_' + uuidv4(),
        subscription: sub.stripe_subscription_id,
        amount_paid: 1500,
        created: Math.floor(Date.now() / 1000),
        hosted_invoice_url: 'https://mock-invoice-url.com'
      }
    }
  };

  // Call webhook handler internally
  fetch(`http://localhost:${PORT}/api/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockEvent)
  }).then(() => {
    res.json({ success: true, message: `Mock payment ${success ? 'succeeded' : 'failed'} triggered` });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});


// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
