# Load Testing & Performance Monitoring Guide

## Overview
This guide explains how to test traffic sustainability and load balancing for your application deployed on Vercel.

## 🎯 What's Included

### 1. Load Testing Scripts (k6)
Four types of load tests to evaluate different aspects:

- **Basic Load Test** - Gradual increase to 100 concurrent users
- **Stress Test** - Push to 400 users to find breaking points
- **Spike Test** - Sudden surge to 500 users
- **Soak Test** - Sustained 50 users for 30 minutes

### 2. Performance Monitoring
Real-time monitoring of Core Web Vitals:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)  
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

---

## 📦 Installation

### Install k6 (Load Testing Tool)

#### Windows (using Chocolatey)
```bash
choco install k6
```

#### Windows (using Scoop)
```bash
scoop install k6
```

#### Windows (Manual Download)
Download from: https://github.com/grafana/k6/releases

#### macOS
```bash
brew install k6
```

#### Linux
```bash
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

---

## 🚀 Running Load Tests

### 1. Local Testing (Development)
Test against your local development server:

```bash
# Start your dev server first
npm run dev

# In another terminal, run load tests
k6 run load-tests/basic-load-test.js
```

### 2. Production Testing
Test your deployed Vercel application:

```bash
# Basic load test
k6 run load-tests/basic-load-test.js -e BASE_URL=https://your-app.vercel.app

# Stress test (find breaking point)
k6 run load-tests/stress-test.js -e BASE_URL=https://your-app.vercel.app

# Spike test (sudden traffic surge)
k6 run load-tests/spike-test.js -e BASE_URL=https://your-app.vercel.app

# Soak test (endurance testing)
k6 run load-tests/soak-test.js -e BASE_URL=https://your-app.vercel.app
```

### 3. Custom Configuration
Adjust test parameters by editing the `options` object in each test file:

```javascript
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Adjust duration and target users
    { duration: '1m', target: 50 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Adjust performance thresholds
    http_req_failed: ['rate<0.1'],
  },
};
```

---

## 📊 Understanding Test Results

### Key Metrics to Monitor

1. **http_req_duration** - Response time
   - p(95) < 2000ms = Good
   - p(95) > 5000ms = Poor

2. **http_req_failed** - Error rate
   - < 1% = Excellent
   - < 5% = Good
   - > 10% = Poor (investigate)

3. **http_reqs** - Requests per second (throughput)

4. **vus** - Virtual Users (concurrent users)

### Sample Output
```
checks.........................: 100.00% ✓ 15000  ✗ 0
data_received..................: 45 MB   750 kB/s
data_sent......................: 1.2 MB  20 kB/s
http_req_duration..............: avg=145ms min=89ms med=132ms max=456ms p(90)=189ms p(95)=223ms
http_req_failed................: 0.00%   ✓ 0      ✗ 15000
http_reqs......................: 15000   250/s
vus............................: 100     min=0    max=100
```

---

## 🔍 Performance Monitoring (In-App)

### Access the Performance Monitor
Navigate to: `http://localhost:5173/performance` (or `/performance` on your deployed app)

### Features
- Real-time Core Web Vitals tracking
- Visual indicators (Good/Needs Improvement/Poor)
- Automatic metric collection
- Console logging of performance data

### Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB | ≤ 800ms | 800ms - 1800ms | > 1800ms |

---

## 🎯 Testing Strategy

### Phase 1: Baseline Testing
```bash
# Run basic load test to establish baseline
k6 run load-tests/basic-load-test.js -e BASE_URL=https://your-app.vercel.app
```
**Goal**: Verify normal operation under expected load

### Phase 2: Stress Testing
```bash
# Find breaking points
k6 run load-tests/stress-test.js -e BASE_URL=https://your-app.vercel.app
```
**Goal**: Determine maximum capacity

### Phase 3: Spike Testing
```bash
# Test sudden traffic surges
k6 run load-tests/spike-test.js -e BASE_URL=https://your-app.vercel.app
```
**Goal**: Verify system handles traffic spikes (e.g., going viral)

### Phase 4: Endurance Testing
```bash
# Long-running test
k6 run load-tests/soak-test.js -e BASE_URL=https://your-app.vercel.app
```
**Goal**: Detect memory leaks and degradation over time

---

## 📈 Analyzing Results

### Success Criteria
✅ **Good Performance**
- p(95) response time < 2s
- Error rate < 1%
- No degradation in soak test
- System recovers quickly from spikes

⚠️ **Needs Optimization**
- p(95) response time 2-5s
- Error rate 1-5%
- Gradual degradation in soak test

❌ **Action Required**
- p(95) response time > 5s
- Error rate > 5%
- System crashes under load
- Memory leaks detected

---

## 🔧 Optimization Tips

### If Tests Fail

1. **High Response Times**
   - Enable caching
   - Optimize images (use WebP, lazy loading)
   - Minimize JavaScript bundle size
   - Use CDN (Vercel does this automatically)

2. **High Error Rate**
   - Check Vercel function limits
   - Verify database connection pooling
   - Review API rate limits
   - Check for timeouts

3. **Memory Leaks (Soak Test)**
   - Review useEffect cleanup
   - Check for event listener cleanup
   - Verify context provider structure

---

## 🌐 Vercel-Specific Considerations

### Vercel Features for Load Balancing
- **Edge Network**: Automatic global CDN
- **Serverless Functions**: Auto-scaling
- **Edge Caching**: Reduces origin load
- **DDoS Protection**: Built-in

### Vercel Analytics
Add to your project:
```bash
npm install @vercel/analytics
```

Then in `main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// Add <Analytics /> to your app
```

---

## 📝 Continuous Monitoring

### Schedule Regular Tests
Create a CI/CD pipeline to run tests:

```yaml
# .github/workflows/load-test.yml
name: Load Testing
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run load test
        run: k6 run load-tests/basic-load-test.js -e BASE_URL=${{ secrets.PRODUCTION_URL }}
```

---

## 🆘 Troubleshooting

### Common Issues

**k6 not found**
- Verify installation: `k6 version`
- Check PATH environment variable

**Connection refused**
- Ensure dev server is running
- Verify correct URL/port

**High error rates on Vercel**
- Check Vercel function logs
- Verify usage limits
- Review billing tier

**CORS errors**
- Configure appropriate CORS headers
- Check Vercel deployment settings

---

## 📚 Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Vercel Performance](https://vercel.com/docs/concepts/analytics)
- [MDN Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)

---

## 🎓 Best Practices

1. **Test Regularly**: Run load tests before major releases
2. **Monitor Production**: Use performance monitoring in production
3. **Set Alerts**: Configure alerts for performance degradation
4. **Gradual Rollout**: Use canary deployments for major changes
5. **Document Baselines**: Keep records of performance benchmarks
6. **Test Realistic Scenarios**: Model actual user behavior patterns

---

## 📞 Next Steps

1. Install k6: `choco install k6` or `brew install k6`
2. Run basic test: `k6 run load-tests/basic-load-test.js`
3. Check performance monitor: Navigate to `/performance` in your app
4. Analyze results and optimize
5. Set up continuous monitoring