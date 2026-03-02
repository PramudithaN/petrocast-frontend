import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Spike test - sudden surge in traffic
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Baseline
    { duration: '10s', target: 500 },  // Sudden spike to 500 users
    { duration: '1m', target: 500 },   // Maintain spike
    { duration: '10s', target: 10 },   // Drop back to baseline
    { duration: '30s', target: 10 },   // Recovery period
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.15'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export default function spikeTest() {
  const response = http.get(`${BASE_URL}/`);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
}
