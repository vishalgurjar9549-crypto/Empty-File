# 🧪 PRODUCTION AUDIT: VERIFICATION & TESTING GUIDE

**Created:** 5 April 2026  
**Purpose:** Step-by-step verification of critical issue fixes  
**Execution Time:** 4-6 hours  
**Required Skills:** Backend developer + QA engineer

---

## VERIFICATION CHECKLIST

### **1. PHONE VERIFICATION ENFORCEMENT ✅**

**What to verify:** Users cannot unlock contacts without verified phone

#### Test Case 1.1: Unverified Phone Cannot Unlock
```
Setup:
  1. Register new user: email=test1@test.com, phone=+919876543210
  2. Verify email (click link)
  3. Skip phone verification (close modal)
  4. Browse to property page

Test:
  1. Click "Unlock Contact"
  2. Expected: Error message "Please verify your phone to unlock"
  3. Actual: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 1.2: Verified Phone Can Unlock
```
Setup:
  1. Register new user
  2. Verify email
  3. Complete phone verification (enter OTP)
  4. Browse to property

Test:
  1. Click "Unlock Contact"
  2. Expected: Contact details revealed
  3. Actual: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 1.3: Faked Phone Number
```
Setup:
  1. Create user with phone +919999999999 in UI
  2. Do NOT receive OTP (because fake)
  3. Attempt unlock via API directly

Test:
  1. POST /api/contacts/unlock with this user's JWT
  2. Expected: 403 "Phone verification required"
  3. Check backend: phoneVerified should be FALSE
  4. Actual: _________

Result: ✅ PASS / ❌ FAIL
```

**Fix Verification:** 
- [ ] Code updated in ContactService.ts:87-104
- [ ] phoneVerified flag checked before unlock
- [ ] UI shows verification status to user
- [ ] Error message clear (actionable next step)

---

### **2. OTP BRUTE FORCE PROTECTION ✅**

**What to verify:** Cannot brute force 6-digit OTP codes

#### Test Case 2.1: Rate Limiting Active
```
Setup:
  1. Register new user: email=test2@test.com
  2. Trigger OTP send via /auth/send-otp endpoint
  3. DON'T enter correct code yet

Test:
  1. Send 5 incorrect codes rapidly (curl loop)
  2. Expected after attempt #4: 429 Too Many Attempts
  3. Actual response code: _________
  4. Check error message: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 2.2: Max Attempts Enforced
```
Test:
  1. Previously rate limited? YES → Wait 60 seconds
  2. Send 001, 002, 003, 004, 005 (5 codes, all wrong)
  3. Expected: On attempt 5, error "Please request new OTP"
  4. Actual response: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 2.3: Correct Code Works After Failure
```
Setup:
  1. Previous test: 5 wrong attempts made
  2. Request new OTP via /auth/send-otp (get fresh code)
  3. Rate limit should be reset

Test:
  1. Send correct code on first attempt
  2. Expected: 200 OK { valid: true }
  3. Actual: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 2.4: Progressive Delays
```
Test:
  1. Send wrong code #1 at time T=0
  2. Measure response time: _________ ms (should be ~500-1000ms)
  3. Send wrong code #2 at time T=2
  4. Measure response time: _________ ms (should be ~1000-2000ms)
  5. Send wrong code #3 at time T=5
  6. Measure response time: _________ ms (should be ~2000-3000ms)

Expected: Delays increase exponentially
Result: ✅ PASS / ❌ FAIL
```

**Fix Verification:**
- [ ] Rate limiter middleware applied to /verify-otp endpoint
- [ ] Redis configured and accessible
- [ ] MAX_ATTEMPTS reduced to 3 in OtpService
- [ ] Progressive delays implemented
- [ ] Monitoring metrics for OTP failures visible in Grafana

---

### **3. CONTACT UNLOCK RATE LIMITING ✅**

**What to verify:** Cannot spam contact unlock requests

#### Test Case 3.1: Single User Rate Limited
```
Setup:
  1. User with GOLD subscription in Bangalore
  2. 5 different properties available

Test:
  1. Rapidly unlock contacts from all 5 properties (< 10 seconds)
  2. Expected: First 5 succeed, attempt #6 returns 429
  3. Actual response on attempt #6: _________
  4. Status code: _________ (should be 429)

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 3.2: Rate Limit Resets
```
Test:
  1. Hit rate limit (5 unlocks done)
  2. Wait 60 seconds
  3. Try unlock again
  4. Expected: Success (200 OK)
  5. Actual: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 3.3: DoS Attack Prevented
```
Test:
  1. Script: Send 1000 unlock requests in 10 seconds from same user
  2. Expected: ~50 succeed, ~950 rate limited
  3. Check server: Database queries should be ~50, not 1000
  4. Metrics: Check dashboard for spike in rate_limit errors
  5. Service should remain responsive for other users

Result: ✅ PASS / ❌ FAIL
```

**Fix Verification:**
- [ ] Rate limiter middleware on POST /api/contacts/unlock
- [ ] Limit set to 5/min per user
- [ ] Rate limit info in response headers (X-RateLimit-*)
- [ ] Monitoring alert triggers if limit exceeded >100 times in 5min

---

### **4. CONTACT UNLOCK METRICS & TELEMETRY ✅**

**What to verify:** Observability into contact unlock failures

#### Test Case 4.1: Success Metrics Recorded
```
Setup:
  1. Enable StatsD metrics collection
  2. Open Grafana dashboard: "Contact Unlock Performance"

Test:
  1. Perform successful contact unlock
  2. Wait 10 seconds
  3. Check metrics:
     - contact_unlock.duration_ms shows value ✓
     - contact_unlock.success incremented ✓
  4. Existing metrics: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 4.2: Serialization Retries Tracked
```
Setup:
  1. Load test: 1000 concurrent unlock requests same room
  2. Expected: Serialization conflicts occur

Test:
  1. Run load test
  2. Check metrics: contact_unlock.serialization_retry incremented
  3. Count: _________ retries observed
  4. Does it show retry count breakdown?

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 4.3: Error Categorization
```
Test:
  1. Trigger error: User has FREE plan, hits 10-contact limit
  2. Check metrics: contact_unlock.error incremented with:
     - errorType: "ContactLimitExceededError" ✓
     - city: "bangalore" ✓
  3. Logged value: _________

Result: ✅ PASS / ❌ FAIL
```

**Fix Verification:**
- [ ] StatsD client configured
- [ ] Metrics middleware on contact unlock endpoint
- [ ] Grafana dashboard created with key charts
- [ ] Alerts configured (retry exhaustion, error spike)
- [ ] Logs include actionable information

---

### **5. PAYMENT SECURITY - TENANT ID VALIDATION ✅**

**What to verify:** Cannot use another user's payment

#### Test Case 5.1: Payment Belongs to Authenticated User
```
Setup:
  1. User A: email=userA@test.com (JWT_A = "xyz...")
  2. User B: email=userB@test.com (JWT_B = "abc...")
  3. User A initiates payment: POST /payments/initiate
     - Response: orderId = "order_123"

Test:
  1. User A completes payment on Razorpay (normally)
  2. Extract signature: signature_A = "sig_valid"
  3. User B attempts to verify SAME payment:
     ```
     POST /api/payments/verify
     Authorization: Bearer JWT_B
     Body: {
       razorpay_order_id: "order_123",
       razorpay_signature: signature_A
     }
     ```
  4. Expected: 403 Forbidden "Payment does not belong to you"
  5. Actual response: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 5.2: Tenant ID Logger Alert
```
Setup:
  1. Instrument logging to catch security violations
  2. Same setup as 5.1

Test:
  1. Perform cross-user payment verification attempt
  2. Check backend logs:
     - Message: "Payment verification SECURITY VIOLATION"
     - Include: paymentId, expectedTenantId, attemptingUserId
  3. Logged: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 5.3: Legitimate Payment Still Works
```
Setup:
  1. User A: Initiates GOLD subscription (₹100) in Bangalore
  2. User A completes Razorpay checkout
  3. Extract valid signature

Test:
  1. User A verifies with correct JWT:
     POST /api/payments/verify
     Authorization: Bearer JWT_A
     Body: {correct payload}
  2. Expected: 200 OK
  3. Subscription created: Check TenantSubscription table
  4. Result: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 5.4: Idempotency Works
```
Setup:
  1. Payment order created and verified (subscriptionupgraded)

Test:
  1. Call verify endpoint AGAIN with same payload
  2. Expected: 200 OK (idempotent, no double subscription)
  3. Subscription should NOT be duplicated
  4. Check DB: How many TenantSubscription records for this

 user+city?
     Expected: 1
     Actual: _________

Result: ✅ PASS / ❌ FAIL
```

**Fix Verification:**
- [ ] payment.tenantId === userId validation in place
- [ ] Security logging for mismatches
- [ ] Alert service configured to notify security team
- [ ] Code review: No way to bypass this check
- [ ] Test with penetration tester (if possible)

---

### **6. MULTI-CITY SUBSCRIPTION ISOLATION ✅**

**What to verify:** Subscription in one city doesn't unlock contacts in another

#### Test Case 6.1: Bangalore Subscription ≠ Kota Access
```
Setup:
  1. User purchases GOLD in Bangalore (₹100)
  2. Wait for subscription to be active
  3. Property exists in Kota (different city)

Test:
  1. Try to unlock contact in Kota property
  2. Expected: 403 "Contact locked - get GOLD subscription"
  3. Actual: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 6.2: Subscription Created in Correct City
```
Setup:
  1. User has GOLD in Bangalore
  2. Check database

Test:
  1. Query: SELECT * FROM tenant_subscriptions WHERE tenantId='...'
  2. Expected results:
     - city = "bangalore" (or normalized form)
     - plan = "GOLD"
     - expiresAt = future date
  3. Actual results: _________

Result: ✅ PASS / ❌ FAIL
```

#### Test Case 6.3: Buy Second City Subscription
```
Setup:
  1. User already has GOLD in Bangalore
  2. User purchases GOLD in Kota (another payment)

Test:
  1. Check database: Should have 2 rows:
     - (tenantId, "bangalore") = GOLD
     - (tenantId, "kota") = GOLD
  2. Each subscription independent? ✓
  3. Cancel Bangalore → Kota still works? ✓
  4. Actual results: _________

Result: ✅ PASS / ❌ FAIL
```

**Fix Verification:**
- [ ] Composite key (tenantId_city) enforced in schema
- [ ] Unique constraint prevents duplicates
- [ ] Unlock logic uses composite key lookup
- [ ] City normalization consistent

---

## LOAD TESTING

### **Load Test 1: Contact Unlock Performance**

```bash
#!/bin/bash
# Test: 1000 concurrent unlock requests

BEARER_TOKEN="user-gold-bangalore"
API_URL="https://api.staging.homilivo.com"
ROOM_ID="room-123"  # Bangalore property
CONCURRENT=100
TOTAL_REQUESTS=1000

echo "Load test: $TOTAL_REQUESTS requests, $CONCURRENT concurrent"

for i in $(seq 1 $TOTAL_REQUESTS); do
  curl -X POST "$API_URL/api/contacts/unlock" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"roomId\":\"$ROOM_ID\"}" \
    -o /dev/null \
    --write-out "%{http_code} %{time_total}s\n" \
    &
    
  # Limit concurrency
  if [ $((i % CONCURRENT)) -eq 0 ]; then
    wait
  fi
done

wait

echo "Test completed. Check metrics in Grafana"
```

**Success Criteria:**
- [ ] 95%+ requests succeed (status 200)
- [ ] None timeout (all respond < 5 seconds)
- [ ] Response time p95 < 1 second
- [ ] Database connection pool doesn't exhaust
- [ ] No cascade failures

---

### **Load Test 2: OTP Brute Force Simulation**

```bash
#!/bin/bash
# Test: Can we brute force OTP?

EMAIL="test@example.com"
API_URL="https://api.staging.homilivo.com"

echo "OTP Brute Force Test"
echo "Attempts to crack 6-digit code"

success=0
failure=0

for code in $(seq 000000 999999); do
  response=$(curl -s -X POST "$API_URL/api/auth/verify-otp" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"code\":\"$code\"}" \
    -w "\n%{http_code}")
  
  http_code=$(echo "$response" | tail -1)
  
  if [ "$http_code" == "200" ]; then
    echo "✅ SUCCESS: OTP cracked at attempt $code"
    success=$((success + 1))
    break
  elif [ "$http_code" == "429" ]; then
    failure=$((failure + 1))
    if [ $((failure % 100)) -eq 0 ]; then
      echo "Rate limited at attempt $code (attempt $failure)"
    fi
  fi
done

if [ $success -eq 0 ]; then
  echo "✅ RESULT: Could not brute force OTP (rate limiting working)"
else
  echo "❌ RESULT: OTP brute forced in $code attempts (SECURITY ISSUE)"
fi
```

**Success Criteria:**
- [ ] Cannot brute force (rate limits kick in)
- [ ] No more than 10 valid attempts before lock
- [ ] Lock lasts >= 5 minutes

---

## DEPLOYMENT CHECKLIST

Before hitting "launch":

### Pre-Deployment
- [ ] All 5 critical fixes implemented
- [ ] Code reviewed by 2 senior developers
- [ ] All test cases above passing
- [ ] Load tests successful
- [ ] Database migrations tested (backup taken)
- [ ] Monitoring dashboards live in staging

### Deployment Window
- [ ] Schedule: Off-peak hours (2-4 AM IST)
- [ ] On-call: 2 engineers watching
- [ ] Communication: Slack channel #deployment
- [ ] Rollback: Git tag with working version ready
- [ ] Kill switches: Feature flags ready

### Post-Deployment (1 hour)
- [ ] Smoke tests: All 5 critical flows tested manually
- [ ] Metrics: Verify data flowing into Grafana
- [ ] Logs: Tail backend logs, no ERROR level messages
- [ ] User reports: Monitor support channels

### Day 1 After Launch
- [ ] Monitor metrics hourly
- [ ] Check payment success rate (should be 99%+)
- [ ] Check contact unlock success rate (should be 95%+)
- [ ] Any P1 incidents: Post-mortem 24h later

---

## SIGN-OFF

### Product Manager
- [ ] Understands risks
- [ ] Agrees to controlled launch constraints
- [ ] Prepared for support issues
- [ ] Budget approved for incident response (if needed)

### Engineering Lead  
- [ ] All fixes reviewed
- [ ] Monitoring configured
- [ ] On-call rotation set
- [ ] Runbook prepared

### QA Lead
- [ ] Test cases executed
- [ ] Load tests passed
- [ ] No blockers remain
- [ ] Report: READY TO LAUNCH / NEEDS FIXES

### Devops/Infrastructure
- [ ] Database backups: Automated, tested
- [ ] Monitoring: Grafana dashboards live
- [ ] Alerting: PagerDuty configured
- [ ] Logs: ELK stack or equivalent running

---

## ROLLBACK PROCEDURE

If critical issue detected after launch:

```bash
# 1. Identify issue (check Grafana alert)
Issue: Payment verification failing for all users

# 2. Decide: Rollback or Hotfix?
- If > 10% failures: ROLLBACK
- If < 1% failures & known cause: HOTFIX

# 3. Execute rollback
git checkout tags/v1.2.3-working
npm run deploy:staging
npm run deploy:prod

# 4. Verify
curl -X POST https://api.homilivo.com/api/payments/verify
# Should work or show improved error

# 5. Post-mortem
- Why did it fail in staging but not prod?
- Could we have caught this earlier?
- What monitoring gap exists?
```

---

**Prepared by:** Production Audit Team  
**Date:** 5 April 2026  
**Next Review:** After all fixes implemented  
