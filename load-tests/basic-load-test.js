import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const pageLoadTime = new Trend('page_load_time');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users over 30s
    { duration: '1m', target: 50 },   // Ramp up to 50 users over 1m
    { duration: '2m', target: 100 },  // Ramp up to 100 users over 2m
    { duration: '1m', target: 50 },   // Ramp down to 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'],     // Error rate should be less than 10%
    errors: ['rate<0.1'],
  },
};

// Replace with your actual deployment URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export default function loadTest() {
  // Test Home page
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'home page status is 200': (r) => r.status === 200,
    'home page loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  pageLoadTime.add(response.timings.duration);
  sleep(1);

  // Test Dashboard page
  response = http.get(`${BASE_URL}/dashboard`);
  check(response, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  pageLoadTime.add(response.timings.duration);
  sleep(1);

  // Test About page
  response = http.get(`${BASE_URL}/about`);
  check(response, {
    'about page status is 200': (r) => r.status === 200,
    'about page loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  pageLoadTime.add(response.timings.duration);
  sleep(2);
}
