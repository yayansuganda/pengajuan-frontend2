# Changelog - API Endpoint Update

## [1.0.1] - 2026-02-09

### Changed
- ✅ Updated API endpoint URL to the correct full path
- **Before**: `https://pospay-callback.posindonesia.co.id/proxy2-api/dev`
- **After**: `https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun`

### Files Updated

#### 1. Core Implementation
- `/src/modules/pengecekan/data/PengecekanRepositoryImpl.ts`
  - Updated `BASE_URL` constant

#### 2. Documentation
- `/INTEGRATION_PENGECEKAN.md`
  - Updated Base URL section
  - Updated Request Example

- `/README_INTEGRATION_COMPLETE.md`
  - Updated Base URL in configuration section

- `/QUICK_REFERENCE.md`
  - Updated API Configuration section
  - Updated curl example

#### 3. Examples
- `/src/shared/examples/pengecekanExamples.ts`
  - Updated URL in console.log
  - Updated fetch URL

### Impact
- ✅ No breaking changes to existing functionality
- ✅ Application still running correctly (HTTP 200)
- ✅ All documentation now reflects correct endpoint

### Testing
```bash
# Verify application is running
curl -s http://localhost:3001/pengecekan -o /dev/null -w "HTTP Status: %{http_code}\n"
# Expected: HTTP Status: 200
```

### API Endpoint Details

**Full Endpoint URL**:
```
https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun
```

**Method**: POST

**Headers**:
- Content-Type: application/json
- X-Partner-Id: M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL
- X-Signature: <JWT_TOKEN>

**Payload**:
```json
{
  "idpensiun": "08000511000"
}
```

### Notes
- Endpoint path now includes the specific resource: `/pensiun/pos/request/dapempensiun`
- This is the correct endpoint for querying pensioner data (dapem pensiun)
- All JWT signature generation logic remains unchanged
- All authentication headers remain the same

---

## [1.0.0] - 2026-02-09

### Added
- Initial integration with Pos Indonesia API
- JWT signature generation with HMAC SHA256
- API logger for debugging
- Comprehensive documentation
- Example code and tests

### Features
- Real-time pensioner data checking
- Automatic JWT token generation
- Request/response logging
- Error handling and user feedback

---

**Last Updated**: 2026-02-09 10:03:00 +08:00
