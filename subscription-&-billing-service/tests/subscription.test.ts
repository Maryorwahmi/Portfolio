import { describe, it } from 'node:test';
import assert from 'node:assert';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:3000/api';

describe('Subscription & Billing API', () => {
  const testEmail = `test-${uuidv4()}@example.com`;
  let planId = '';
  let subscriptionId = '';

  it('should fetch available plans', async () => {
    const res = await fetch(`${API_URL}/plans`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.plans.length > 0);
    planId = data.plans[0].id;
  });

  it('should initiate a subscription', async () => {
    const res = await fetch(`${API_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, planId }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.subscriptionId);
    assert.strictEqual(data.status, 'incomplete');
    subscriptionId = data.subscriptionId;
  });

  it('should retrieve the subscription details', async () => {
    const res = await fetch(`${API_URL}/subscription?email=${encodeURIComponent(testEmail)}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.subscription);
    assert.strictEqual(data.subscription.status, 'incomplete');
  });

  it('should handle mock successful payment webhook', async () => {
    const res = await fetch(`${API_URL}/mock-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, success: true }),
    });
    assert.strictEqual(res.status, 200);
    
    // Check if subscription status updated
    const subRes = await fetch(`${API_URL}/subscription?email=${encodeURIComponent(testEmail)}`);
    const subData = await subRes.json();
    assert.strictEqual(subData.subscription.status, 'active');
  });

  it('should retrieve generated invoices', async () => {
    const res = await fetch(`${API_URL}/invoices?email=${encodeURIComponent(testEmail)}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.invoices.length > 0);
    assert.strictEqual(data.invoices[0].status, 'paid');
  });

  it('should handle mock failed payment webhook', async () => {
    const res = await fetch(`${API_URL}/mock-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, success: false }),
    });
    assert.strictEqual(res.status, 200);
    
    // Check if subscription status updated
    const subRes = await fetch(`${API_URL}/subscription?email=${encodeURIComponent(testEmail)}`);
    const subData = await subRes.json();
    assert.strictEqual(subData.subscription.status, 'past_due');
  });
});
