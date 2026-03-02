# Quick Reference: Load Testing Commands

## 🚀 Prerequisites
Install k6 first:
- **Windows**: `choco install k6` or `scoop install k6`
- **macOS**: `brew install k6`
- **Linux**: See LOAD_TESTING_GUIDE.md for installation

---

## ⚡ Quick Commands

### Test Local Development Server
```bash
# Start dev server
npm run dev

# In another terminal
npm run load-test:local
```

### Test Production (Vercel)
```bash
# Set your production URL
$env:PRODUCTION_URL="https://your-app.vercel.app"  # Windows PowerShell
# or
export PRODUCTION_URL="https://your-app.vercel.app"  # macOS/Linux

# Run tests
npm run load-test:prod      # Basic: 100 users
npm run load-test:stress    # Stress: 400 users
npm run load-test:spike     # Spike: 500 users surge
npm run load-test:soak      # Endurance: 30 min test
```

### Direct k6 Commands
```bash
# Basic test
k6 run load-tests/basic-load-test.js -e BASE_URL=https://your-app.vercel.app

# Stress test
k6 run load-tests/stress-test.js -e BASE_URL=https://your-app.vercel.app

# Spike test
k6 run load-tests/spike-test.js -e BASE_URL=https://your-app.vercel.app

# Soak test (30 minutes)
k6 run load-tests/soak-test.js -e BASE_URL=https://your-app.vercel.app
```

---

## 📊 View Performance Metrics

### In-App Performance Monitor
Navigate to: `/performance` in your browser

Shows real-time:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

### Browser DevTools
1. Open DevTools (F12)
2. Go to "Performance" tab
3. Check Console for performance logs

---

## 📈 Success Criteria

| Metric | Good ✅ | Warning ⚠️ | Poor ❌ |
|--------|---------|-----------|--------|
| Response Time (p95) | < 2s | 2-5s | > 5s |
| Error Rate | < 1% | 1-5% | > 5% |
| Throughput | Stable | Varies | Drops |

---

## 🎯 Test Strategy

1. **Baseline** → Run `load-test:prod` to establish normal performance
2. **Stress** → Run `load-test:stress` to find capacity limits
3. **Spike** → Run `load-test:spike` to test traffic surges
4. **Soak** → Run `load-test:soak` to detect memory leaks

---

## 🔍 Common Issues

**Error: k6 not found**
→ Install k6 (see Prerequisites)

**High error rate**
→ Check Vercel function logs
→ Verify API endpoints
→ Review rate limits

**Slow response times**
→ Optimize images
→ Reduce bundle size
→ Enable caching

---

## 📚 Full Documentation
See [LOAD_TESTING_GUIDE.md](./LOAD_TESTING_GUIDE.md) for complete guide

## 🌐 Vercel Dashboard
Monitor in real-time: https://vercel.com/dashboard

---

**Ready to test? Start here:**
```bash
npm run dev
npm run load-test:local
```