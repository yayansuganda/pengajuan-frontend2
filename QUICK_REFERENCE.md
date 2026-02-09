# Quick Reference - Pengecekan API Integration

## 🚀 Quick Start

### Test di Browser
```
1. Buka: http://localhost:3001/pengecekan
2. Input NOPEN: 08000511000
3. Klik: Cek Data
```

### Debug di Console
```javascript
// Lihat logs
window.pengecekanAPILogger.getLogs()

// Lihat stats
window.pengecekanAPILogger.printStats()

// Analyze JWT
window.pengecekanAPILogger.analyzeJWTTokens()
```

---

## 📝 API Configuration

```javascript
BASE_URL: 'https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun'
PARTNER_ID: 'M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL'
SECRET_KEY: 'jNlMdUdxtqflm5LqX1aMZAR7sHQgyqOnu2tpDp84eOm40nDCqzFqJvaD7JJX1j55'
```

---

## 🔑 JWT Format

```
header.payload.signature

Header: {"alg":"HS256","typ":"JWT"}
Payload: {"idpensiun":"NOPEN"}
Signature: HMACSHA256(base64url(header).base64url(payload), secret)
```

---

## 📋 Request Example

```bash
curl -X POST \
  https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun \
  -H 'Content-Type: application/json' \
  -H 'X-Partner-Id: M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL' \
  -H 'X-Signature: eyJhbGc...signature' \
  -d '{"idpensiun":"08000511000"}'
```

---

## 🗂️ Key Files

| File | Purpose |
|------|---------|
| `jwtHelper.ts` | JWT token generation |
| `PengecekanRepositoryImpl.ts` | API integration |
| `apiLogger.ts` | Debugging & monitoring |
| `INTEGRATION_PENGECEKAN.md` | Full documentation |

---

## 🐛 Common Issues

### CORS Error
→ API server configuration issue

### Invalid Signature
→ Check payload format & secret key

### Data Not Found
→ Verify NOPEN exists in system

### Slow Response
→ Check network & API server status

---

## 📊 Monitoring

```javascript
// Get statistics
const stats = window.pengecekanAPILogger.getStats()
console.log(stats)
// Output: { total, successful, failed, successRate, avgDuration }

// Get failed requests
const failed = window.pengecekanAPILogger.getFailedRequests()
console.log(failed)

// Export all logs
const logs = window.pengecekanAPILogger.exportLogs()
console.log(logs)
```

---

## ✅ Status

- [x] JWT Helper implemented
- [x] API integration complete
- [x] Logging enabled
- [x] Documentation ready
- [x] Application tested

**Ready for production testing!**
