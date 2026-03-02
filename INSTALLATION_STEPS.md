# Installation & Testing Steps

## ✅ Completed
- [x] Development server is running at http://localhost:5173/
- [x] Performance monitoring is active
- [x] Load testing scripts are ready

---

## 🔧 Next: Install k6 (Load Testing Tool)

### Option 1: Chocolatey (Recommended for Windows)
```powershell
# Run PowerShell as Administrator
choco install k6
```

### Option 2: Scoop
```powershell
scoop install k6
```

### Option 3: Manual Download
1. Go to: https://github.com/grafana/k6/releases
2. Download `k6-v0.xx.x-windows-amd64.zip`
3. Extract and add to PATH

### Option 4: Using WSL/Linux
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

---

## 📊 Test Performance Monitor NOW

**Your dev server is running!** Open your browser and navigate to:

### http://localhost:5173/performance

You should see:
- ✅ Real-time Core Web Vitals
- ✅ LCP, FID, CLS, TTFB metrics
- ✅ Color-coded performance indicators
- ✅ Page load metrics

**Also check the browser console (F12)** - you'll see performance logs like:
```
📊 Performance Metrics: {
  Load Time: XXXms,
  DOM Content Loaded: XXXms,
  LCP: XXXms,
  ...
}
```

---

## 🚀 After Installing k6

### 1. Verify Installation
```bash
k6 version
```

### 2. Run Your First Load Test (Local)
```bash
npm run load-test:local
```

**Expected Output:**
```
     ✓ home page status is 200
     ✓ home page loads in <2s
     ✓ dashboard status is 200
     ✓ dashboard loads in <2s

     checks.........................: 100.00% ✓ 600   ✗ 0
     data_received..................: 1.2 MB  20 kB/s
     data_sent......................: 24 kB   400 B/s
     http_req_duration..............: avg=145ms min=89ms med=132ms max=456ms
     http_reqs......................: 300     5/s
     vus............................: 10      min=10  max=100
```

### 3. Test Production (After Deployment)
```bash
# Set your Vercel URL
export PRODUCTION_URL="https://your-app.vercel.app"  # macOS/Linux
# or
$env:PRODUCTION_URL="https://your-app.vercel.app"   # PowerShell

# Run production tests
npm run load-test:prod
```

---

## 📈 What to Look For

### Good Performance ✅
- Response time (p95) < 2 seconds
- Error rate < 1%
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- All checks passing

### Warning Signs ⚠️
- Response time 2-5 seconds
- Error rate 1-5%
- Metrics in "Needs Improvement" range

### Action Required ❌
- Response time > 5 seconds
- Error rate > 5%
- System crashes under load
- Metrics in "Poor" range

---

## 🎯 Testing Workflow

1. **Baseline Test** (Now)
   - Visit http://localhost:5173/performance
   - Note the performance metrics
   - Check all pages load correctly

2. **Load Test** (After k6 install)
   - Run `npm run load-test:local`
   - Verify 100 users can be handled
   - Confirm error rate < 1%

3. **Stress Test** (Optional)
   - Run `npm run load-test:stress`
   - Find your breaking point
   - Identify bottlenecks

4. **Production Test** (After Vercel deployment)
   - Run `npm run load-test:prod`
   - Verify production can handle load
   - Monitor Vercel dashboard

---

## 🔍 Troubleshooting

### Performance Monitor Not Showing Data
- Wait 2-3 seconds for metrics to collect
- Refresh the page
- Check browser console for errors

### Load Tests Failing
- Ensure dev server is running
- Check the correct URL is being used
- Verify network connectivity

### High Response Times
- Check for console errors
- Review network tab in DevTools
- Optimize large images/assets

---

## 📚 Documentation

- Full Guide: [LOAD_TESTING_GUIDE.md](./LOAD_TESTING_GUIDE.md)
- Quick Reference: [LOAD_TESTING_QUICK_REF.md](./LOAD_TESTING_QUICK_REF.md)
- k6 Docs: https://k6.io/docs/

---

## ✨ Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server

# Load Testing
npm run load-test:local       # Basic load test (local)
npm run load-test:prod        # Basic load test (production)
npm run load-test:stress      # Stress test (400 users)
npm run load-test:spike       # Spike test (500 users surge)
npm run load-test:soak        # Endurance test (30 minutes)

# Direct k6 Commands
k6 run load-tests/basic-load-test.js
k6 run load-tests/stress-test.js -e BASE_URL=http://localhost:5173
```

---

## 🎉 Current Status

✅ **Ready to Test:**
- Development server is running
- Performance monitoring is active
- Navigate to http://localhost:5173/performance

⏳ **Pending:**
- Install k6
- Run load tests
- Deploy to production
- Test production deployment

---

**Next Immediate Action:** 
Open your browser and visit **http://localhost:5173/performance** to see the performance monitor in action!
