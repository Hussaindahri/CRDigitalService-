import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import {
  createSessionToken,
  getDb,
  getUserFromToken,
  hashPassword,
  isValidOrderStatus,
  isValidPlatform,
  nextId,
  sanitizeUser,
  saveDb,
} from './server/store.ts';
import type { OrderRecord, PaymentRecord, ServiceItem } from './src/types/domain.ts';

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Helper to resolve bearer token
  function resolveAuth(req: express.Request) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return null;
    const token = header.slice('Bearer '.length).trim();
    return getUserFromToken(token);
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    if (user.status === 'Suspended') {
      res.status(403).json({ error: 'This account is suspended. Contact operations support.' });
      return;
    }
    const token = createSessionToken(user.id);
    res.json({ token, user: sanitizeUser(user) });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, company } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      company?: string;
    };
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      res.status(400).json({ error: 'Name, valid email, and password (min 6 characters) are required.' });
      return;
    }
    const db = getDb();
    const exists = db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    const newUser = {
      id: nextId('USR', db.users),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || 'Independent Creator',
      role: 'client' as const,
      balance: 25.0, // Welcome test credit for immediate interactive testing
      totalSpent: 0,
      status: 'Active' as const,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
    };
    db.users.push(newUser);
    const welcomePayment: PaymentRecord = {
      id: nextId('PAY', db.payments),
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      method: 'Onboarding Credit',
      reference: 'WELCOME-25',
      amount: 25.0,
      type: 'Deposit',
      status: 'Approved',
      createdAt: new Date().toISOString(),
    };
    db.payments.unshift(welcomePayment);
    const token = createSessionToken(newUser.id);
    saveDb();
    res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = resolveAuth(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    res.json({ user: sanitizeUser(user) });
  });

  app.post('/api/auth/logout', (req, res) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.slice('Bearer '.length).trim();
      const db = getDb();
      delete db.sessions[token];
      saveDb();
    }
    res.json({ ok: true });
  });

  // Public services catalog
  app.get('/api/services', (req, res) => {
    const db = getDb();
    const includeInactive = req.query.includeInactive === 'true';
    const platform = typeof req.query.platform === 'string' ? req.query.platform : undefined;
    let list = includeInactive ? db.services : db.services.filter((s) => s.active);
    if (platform && isValidPlatform(platform)) {
      list = list.filter((s) => s.platform === platform);
    }
    res.json({ services: list });
  });

  // Public inquiry / discovery form
  app.post('/api/inquiries', (req, res) => {
    const { name, email, platform, monthlyBudget, notes } = req.body as {
      name?: string;
      email?: string;
      platform?: string;
      monthlyBudget?: string;
      notes?: string;
    };
    if (!name?.trim() || !email?.trim() || !email.includes('@')) {
      res.status(400).json({ error: 'Please provide your name and a valid email address.' });
      return;
    }
    const db = getDb();
    const record = {
      id: nextId('INQ', db.inquiries),
      name: name.trim(),
      email: email.trim(),
      platform: platform || 'Multi-Platform',
      monthlyBudget: monthlyBudget || '$500 – $2,000',
      notes: notes?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    db.inquiries.unshift(record);
    saveDb();
    res.status(201).json({ inquiry: record });
  });

  // Authenticated client orders
  app.get('/api/orders', (req, res) => {
    const user = resolveAuth(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const db = getDb();
    const orders =
      user.role === 'admin'
        ? db.orders
        : db.orders.filter((o) => o.userId === user.id);
    res.json({ orders });
  });

  app.post('/api/orders', (req, res) => {
    const user = resolveAuth(req);
    if (!user) {
      res.status(401).json({ error: 'Please sign in to place an order.' });
      return;
    }
    const { serviceId, targetUrl, quantity } = req.body as {
      serviceId?: string;
      targetUrl?: string;
      quantity?: number;
    };
    const db = getDb();
    const service = db.services.find((s) => s.id === serviceId && s.active);
    if (!service) {
      res.status(404).json({ error: 'Selected service is unavailable.' });
      return;
    }
    if (!targetUrl?.trim() || !/^https?:\/\/.+/.test(targetUrl.trim())) {
      res.status(400).json({ error: 'Enter a valid destination URL starting with http:// or https://.' });
      return;
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < service.minOrder || qty > service.maxOrder) {
      res.status(400).json({
        error: `Quantity must be between ${service.minOrder.toLocaleString()} and ${service.maxOrder.toLocaleString()}.`,
      });
      return;
    }
    const charge = Number(((qty / 1000) * service.ratePer1k).toFixed(2));
    if (user.balance < charge) {
      res.status(400).json({
        error: `Insufficient wallet balance ($${user.balance.toFixed(2)} available, $${charge.toFixed(2)} required). Add funds on the Payments page.`,
      });
      return;
    }

    user.balance = Number((user.balance - charge).toFixed(2));
    user.totalSpent = Number((user.totalSpent + charge).toFixed(2));

    const order: OrderRecord = {
      id: nextId('ORD', db.orders),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      serviceId: service.id,
      serviceName: service.name,
      platform: service.platform,
      targetUrl: targetUrl.trim(),
      quantity: qty,
      delivered: 0,
      charge,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    db.orders.unshift(order);

    const debit: PaymentRecord = {
      id: nextId('PAY', db.payments),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      method: 'Wallet Debit',
      reference: order.id,
      amount: -charge,
      type: 'Order Debit',
      status: 'Approved',
      createdAt: new Date().toISOString(),
    };
    db.payments.unshift(debit);
    saveDb();

    res.status(201).json({ order, user: sanitizeUser(user) });
  });

  app.post('/api/orders/:id/refill', (req, res) => {
    const user = resolveAuth(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const db = getDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order || (order.userId !== user.id && user.role !== 'admin')) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    order.refillRequested = true;
    saveDb();
    res.json({ order });
  });

  app.post('/api/orders/:id/cancel', (req, res) => {
    const user = resolveAuth(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const db = getDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order || (order.userId !== user.id && user.role !== 'admin')) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (order.status !== 'Pending') {
      res.status(400).json({ error: 'Only Pending orders can be cancelled.' });
      return;
    }
    order.status = 'Cancelled';
    const owner = db.users.find((u) => u.id === order.userId);
    if (owner) {
      owner.balance = Number((owner.balance + order.charge).toFixed(2));
      owner.totalSpent = Math.max(0, Number((owner.totalSpent - order.charge).toFixed(2)));
      db.payments.unshift({
        id: nextId('PAY', db.payments),
        userId: owner.id,
        userName: owner.name,
        userEmail: owner.email,
        method: 'Order Refund',
        reference: order.id,
        amount: order.charge,
        type: 'Refund',
        status: 'Approved',
        createdAt: new Date().toISOString(),
      });
    }
    saveDb();
    res.json({ order, user: sanitizeUser(user) });
  });

  // Payments & Wallet
  app.get('/api/payments', (req, res) => {
    const user = resolveAuth(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const db = getDb();
    const payments =
      user.role === 'admin'
        ? db.payments
        : db.payments.filter((p) => p.userId === user.id);
    res.json({ payments });
  });

  app.post('/api/payments/deposit', (req, res) => {
    const user = resolveAuth(req);
    if (!user) {
      res.status(401).json({ error: 'Please sign in to add funds.' });
      return;
    }
    const { method, amount, reference, currency } = req.body as {
      method?: string;
      amount?: number;
      reference?: string;
      currency?: 'USD' | 'PKR';
    };
    const numericAmount = Number(amount);
    const activeCurrency: 'USD' | 'PKR' = currency === 'PKR' ? 'PKR' : 'USD';
    const USD_TO_PKR = 278;
    const usdAmount =
      activeCurrency === 'PKR'
        ? Number((numericAmount / USD_TO_PKR).toFixed(2))
        : Number(numericAmount.toFixed(2));

    if (
      !method?.trim() ||
      !Number.isFinite(numericAmount) ||
      usdAmount < 5 ||
      usdAmount > 25000
    ) {
      res.status(400).json({
        error:
          activeCurrency === 'PKR'
            ? 'Deposit amount must be at least Rs 1,390 PKR ($5.00 USD).'
            : 'Deposit amount must be between $5.00 and $25,000.',
      });
      return;
    }

    const db = getDb();
    const isInstant = method === 'Card (Stripe)';
    const payment: PaymentRecord = {
      id: nextId('PAY', db.payments),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      method: method.trim(),
      reference: reference?.trim() || `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: usdAmount,
      currency: activeCurrency,
      originalAmount: Number(numericAmount.toFixed(2)),
      type: 'Deposit',
      status: isInstant ? 'Approved' : 'Pending',
      createdAt: new Date().toISOString(),
    };
    db.payments.unshift(payment);
    if (isInstant) {
      user.balance = Number((user.balance + usdAmount).toFixed(2));
    }
    saveDb();
    res.status(201).json({ payment, user: sanitizeUser(user) });
  });

  // Admin routes
  function requireAdmin(req: express.Request, res: express.Response) {
    const user = resolveAuth(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return null;
    }
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Administrator privileges required' });
      return null;
    }
    return user;
  }

  app.get('/api/admin/overview', (req, res) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const db = getDb();
    res.json({
      users: db.users.map(sanitizeUser),
      services: db.services,
      orders: db.orders,
      payments: db.payments,
      inquiries: db.inquiries,
    });
  });

  app.patch('/api/admin/orders/:id', (req, res) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const { status, delivered } = req.body as { status?: string; delivered?: number };
    const db = getDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (status && !isValidOrderStatus(status)) {
      res.status(400).json({ error: 'Invalid order status' });
      return;
    }

    const previousStatus = order.status;
    if (status && isValidOrderStatus(status)) {
      order.status = status;
      if (status === 'Completed') {
        order.delivered = order.quantity;
      }
      if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
        const owner = db.users.find((u) => u.id === order.userId);
        if (owner) {
          owner.balance = Number((owner.balance + order.charge).toFixed(2));
          owner.totalSpent = Math.max(0, Number((owner.totalSpent - order.charge).toFixed(2)));
          db.payments.unshift({
            id: nextId('PAY', db.payments),
            userId: owner.id,
            userName: owner.name,
            userEmail: owner.email,
            method: 'Admin Refund',
            reference: order.id,
            amount: order.charge,
            type: 'Refund',
            status: 'Approved',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    if (typeof delivered === 'number' && Number.isFinite(delivered)) {
      order.delivered = Math.max(0, Math.min(order.quantity, Math.round(delivered)));
    }
    saveDb();
    res.json({ order });
  });

  app.post('/api/admin/services', (req, res) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const body = req.body as Partial<ServiceItem>;
    if (
      !body.platform ||
      !isValidPlatform(body.platform) ||
      !body.name?.trim() ||
      !body.category?.trim() ||
      typeof body.ratePer1k !== 'number' ||
      body.ratePer1k <= 0
    ) {
      res.status(400).json({ error: 'Valid platform, name, category, and positive rate are required.' });
      return;
    }
    const db = getDb();
    const prefixMap: Record<string, string> = {
      youtube: 'YT',
      tiktok: 'TT',
      instagram: 'IG',
      telegram: 'TG',
      facebook: 'FB',
      linkedin: 'LI',
      pinterest: 'PI',
      snapchat: 'SC',
    };
    const newService: ServiceItem = {
      id: nextId(prefixMap[body.platform] || 'SRV', db.services),
      platform: body.platform,
      name: body.name.trim(),
      category: body.category.trim(),
      ratePer1k: Number(body.ratePer1k.toFixed(2)),
      minOrder: Math.max(10, Number(body.minOrder || 100)),
      maxOrder: Math.max(100, Number(body.maxOrder || 100000)),
      startTime: body.startTime?.trim() || '0–2 hrs',
      speed: body.speed?.trim() || '5K/day',
      retention: body.retention?.trim() || '30-day refill',
      description: body.description?.trim() || 'Managed campaign fulfillment service.',
      active: body.active !== false,
    };
    db.services.unshift(newService);
    saveDb();
    res.status(201).json({ service: newService });
  });

  app.patch('/api/admin/services/:id', (req, res) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const db = getDb();
    const service = db.services.find((s) => s.id === req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    const body = req.body as Partial<ServiceItem>;
    if (typeof body.name === 'string' && body.name.trim()) service.name = body.name.trim();
    if (typeof body.category === 'string' && body.category.trim()) service.category = body.category.trim();
    if (typeof body.ratePer1k === 'number' && body.ratePer1k > 0) service.ratePer1k = Number(body.ratePer1k.toFixed(2));
    if (typeof body.minOrder === 'number' && body.minOrder >= 1) service.minOrder = Math.round(body.minOrder);
    if (typeof body.maxOrder === 'number' && body.maxOrder >= service.minOrder) service.maxOrder = Math.round(body.maxOrder);
    if (typeof body.startTime === 'string') service.startTime = body.startTime.trim();
    if (typeof body.speed === 'string') service.speed = body.speed.trim();
    if (typeof body.retention === 'string') service.retention = body.retention.trim();
    if (typeof body.description === 'string') service.description = body.description.trim();
    if (typeof body.active === 'boolean') service.active = body.active;
    saveDb();
    res.json({ service });
  });

  app.delete('/api/admin/services/:id', (req, res) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const db = getDb();
    const index = db.services.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    db.services.splice(index, 1);
    saveDb();
    res.json({ ok: true });
  });

  app.patch('/api/admin/payments/:id', (req, res) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const { status } = req.body as { status?: 'Approved' | 'Rejected' };
    if (status !== 'Approved' && status !== 'Rejected') {
      res.status(400).json({ error: 'Status must be Approved or Rejected' });
      return;
    }
    const db = getDb();
    const payment = db.payments.find((p) => p.id === req.params.id);
    if (!payment) {
      res.status(404).json({ error: 'Payment record not found' });
      return;
    }
    if (payment.status !== 'Pending') {
      res.status(400).json({ error: 'Payment has already been processed.' });
      return;
    }
    payment.status = status;
    if (status === 'Approved' && payment.type === 'Deposit') {
      const targetUser = db.users.find((u) => u.id === payment.userId);
      if (targetUser) {
        targetUser.balance = Number((targetUser.balance + payment.amount).toFixed(2));
      }
    }
    saveDb();
    res.json({ payment });
  });

  app.patch('/api/admin/users/:id', (req, res) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const { balanceAdjustment, status } = req.body as {
      balanceAdjustment?: number;
      status?: 'Active' | 'Suspended';
    };
    const db = getDb();
    const targetUser = db.users.find((u) => u.id === req.params.id);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (typeof balanceAdjustment === 'number' && Number.isFinite(balanceAdjustment) && balanceAdjustment !== 0) {
      targetUser.balance = Math.max(0, Number((targetUser.balance + balanceAdjustment).toFixed(2)));
      db.payments.unshift({
        id: nextId('PAY', db.payments),
        userId: targetUser.id,
        userName: targetUser.name,
        userEmail: targetUser.email,
        method: 'Admin Adjustment',
        reference: `ADJ-${admin.id}`,
        amount: Number(balanceAdjustment.toFixed(2)),
        type: balanceAdjustment > 0 ? 'Deposit' : 'Order Debit',
        status: 'Approved',
        createdAt: new Date().toISOString(),
      });
    }
    if (status === 'Active' || status === 'Suspended') {
      targetUser.status = status;
    }
    saveDb();
    res.json({ user: sanitizeUser(targetUser) });
  });

  // Frontend middleware / static serving
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CR Digital Servicing running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
