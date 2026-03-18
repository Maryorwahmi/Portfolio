import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

async function runConcurrencyTest() {
  console.log('Starting concurrency test...');

  // 1. Fetch available slots
  const providersRes = await fetch(`${API_URL}/providers`);
  const providers = await providersRes.json();
  const providerId = providers[0].id;

  const slotsRes = await fetch(`${API_URL}/providers/${providerId}/slots`);
  const slots = await slotsRes.json() as any[];

  if (slots.length === 0) {
    console.log('No available slots to test.');
    return;
  }

  const targetSlotId = slots[0].id;
  console.log(`Targeting slot ${targetSlotId} for concurrent booking...`);

  // 2. Simulate 10 concurrent booking requests for the same slot
  const clients = ['u2', 'u3', 'u2', 'u3', 'u2', 'u3', 'u2', 'u3', 'u2', 'u3'];
  
  const requests = clients.map((clientId, index) => {
    return fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: targetSlotId, client_id: clientId })
    })
    .then(async res => {
      const data = await res.json();
      return { index, status: res.status, data };
    })
    .catch(err => ({ index, status: 500, error: err.message }));
  });

  const results = await Promise.all(requests);

  // 3. Analyze results
  const successfulBookings = results.filter(r => r.status === 201);
  const failedBookings = results.filter(r => r.status === 409);

  console.log('\\n--- Test Results ---');
  console.log(`Total Requests: ${requests.length}`);
  console.log(`Successful Bookings: ${successfulBookings.length}`);
  console.log(`Failed Bookings (Double Booking Prevented): ${failedBookings.length}`);

  if (successfulBookings.length === 1) {
    console.log('✅ SUCCESS: Only one booking succeeded. Concurrency control is working perfectly.');
  } else {
    console.log('❌ FAILURE: Concurrency control failed. Multiple bookings succeeded.');
  }

  console.log('\\nDetailed Responses:');
  results.forEach((r: any) => {
    console.log(`Request ${r.index + 1}: Status ${r.status} - ${JSON.stringify(r.data || r.error)}`);
  });
}

runConcurrencyTest().catch(console.error);
