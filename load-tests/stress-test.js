import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestCount = new Counter('requests');
const responseTime = new Trend('response_time');

// Stress test configuration - gradually increase load to find breaking point
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '3m', target: 200 },   // Increase to 200 users
    { duration: '2m', target: 300 },   // Push to 300 users
    { duration: '2m', target: 400 },   // Stress test at 400 users
    { duration: '5m', target: 400 },   // Stay at 400 for 5 minutes
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<5000'], // 99% of requests should be below 5s
    http_req_failed: ['rate<0.2'],     // Allow up to 20% errors in stress test
    errors: ['rate<0.2'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export default function () {
  const pages = ['/', '/dashboard', '/about'];
  
  // Random page selection to simulate real user behavior
  const page = pages[Math.floor(Math.random() * pages.length)];
  
  const response = http.get(`${BASE_URL}${page}`);
  requestCount.add(1);
  responseTime.add(response.timings.duration);
  
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 5000,
  });
  
  if (!success) {
    errorRate.add(1);
  }
  
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

export function handleSummary(data) {
  return {
    'summary-stress-test.json': JSON.stringify(data),
  };
}
