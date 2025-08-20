import fetch from 'node-fetch';
const requests = [
  transferOwnership('order-001', 'user-002'),
  transferOwnership('order-002', 'user-002'),
  //   transferOwnership('order-004', 'user-002'),
  //   transferOwnership('order-005', 'user-002'),
];

export async function transferOwnership(orderId, newUserId) {
  const BASE_URL = 'http://localhost:3000'; // Update with your server URL
  const ENDPOINT_PATH = '/orders';
  const url = `${BASE_URL}${ENDPOINT_PATH}/${orderId}/transfer-ownership`;

  const requestBody = {
    newUserId,
  };

  console.log(`Sending request for order ${orderId} to user ${newUserId}...`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    const result = await response.json();

    console.log(
      `✓ Order ${orderId}: Status ${response.status} in ${duration}ms`,
    );
    console.log(`  Response:`, result);

    return {
      orderId,
      newUserId,
      status: response.status,
      duration,
      result,
    };
  } catch (error) {
    console.error(`✗ Order ${orderId}: Error -`, error.message);
    return {
      orderId,
      newUserId,
      error: error.message,
    };
  }
}

export async function runParallelRequests() {
  console.log('Starting parallel transfer ownership requests...\n');

  const startTime = Date.now();

  try {
    const results = await Promise.all(requests);
    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    console.log('\n=== RESULTS SUMMARY ===');
    console.log(`Total execution time: ${totalDuration}ms`);
    console.log(`Requests sent: ${requests.length}`);

    const successful = results.filter(
      (r) => r?.status && r?.status >= 200 && r.status < 300,
    );
    const failed = results.filter(
      (r) => r.error || (r?.status && r.status >= 400),
    );

    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nFailed requests:');
      failed.forEach((f) =>
        console.log(`  - Order ${f.orderId}: ${f.error || f.status}`),
      );
    }
  } catch (error) {
    console.error('Error running parallel requests:', error);
  }
}

// Run the script
runParallelRequests();
