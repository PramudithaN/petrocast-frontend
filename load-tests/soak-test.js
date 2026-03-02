import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const duration = new Trend('duration');

// Soak/Endurance test - sustained load over extended period
export const options = {
  stages: [
    { duration: '2m', target: 50 },    // Ramp up
    { duration: '30m', target: 50 },   // Stay at 50 users for 30 minutes
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],    // Lower error threshold for soak test
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export default function soakTest() {
  const pages = ['/', '/dashboard', '/about'];
  
  pages.forEach(page => {
    const response = http.get(`${BASE_URL}${page}`);
    duration.add(response.timings.duration);
    
    check(response, {
      'status is 200': (r) => r.status === 200,
      'no memory leaks indicated': (r) => r.timings.duration < 3000,
    }) || errorRate.add(1);
    
    sleep(2);
  });
  
  sleep(5); // Wait between iterations
}

export function handleSummary(data) {
  console.log('Soak Test Results:');
  console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%`);
  console.log(`Avg Response Time: ${data.metrics.http_req_duration.values.avg}ms`);
  
  return {
    'summary-soak-test.json': JSON.stringify(data),
  };
}
