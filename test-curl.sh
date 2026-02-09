#!/bin/bash

# Test API Pengecekan Pensiunan dengan curl
# Script ini akan generate JWT dan call API langsung

echo "============================================================"
echo "TEST API PENGECEKAN PENSIUNAN DENGAN CURL"
echo "============================================================"
echo ""

# Konfigurasi
NOPEN="08000511000"
BASE_URL="https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun"
PARTNER_ID="M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL"
SECRET_KEY="jNlMdUdxtqflm5LqX1aMZAR7sHQgyqOnu2tpDp84eOm40nDCqzFqJvaD7JJX1j55"

# Payload
PAYLOAD="{\"idpensiun\":\"$NOPEN\"}"

echo "1. Payload:"
echo "$PAYLOAD"
echo ""

# Generate JWT menggunakan Node.js
echo "2. Generating JWT Token..."
JWT_TOKEN=$(node -e "
const crypto = require('crypto');

function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

const header = {alg: 'HS256', typ: 'JWT'};
const payload = {idpensiun: '$NOPEN'};

const encodedHeader = base64UrlEncode(JSON.stringify(header));
const encodedPayload = base64UrlEncode(JSON.stringify(payload));

const signatureInput = encodedHeader + '.' + encodedPayload;
const signature = crypto
    .createHmac('sha256', '$SECRET_KEY')
    .update(signatureInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

console.log(encodedHeader + '.' + encodedPayload + '.' + signature);
")

echo "JWT Token: $JWT_TOKEN"
echo ""

# Call API
echo "3. Calling API..."
echo "URL: $BASE_URL"
echo ""

RESPONSE=$(curl -s -w "\n---HTTP_CODE:%{http_code}---" \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-Partner-Id: $PARTNER_ID" \
  -H "X-Signature: $JWT_TOKEN" \
  -d "$PAYLOAD")

# Extract HTTP code
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | sed 's/.*HTTP_CODE:\([0-9]*\).*/\1/')
BODY=$(echo "$RESPONSE" | sed '/---HTTP_CODE/d')

echo "4. Response:"
echo "HTTP Code: $HTTP_CODE"
echo ""
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Parse response
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS!"
    echo ""
    
    # Extract data
    NAMA=$(echo "$BODY" | jq -r '.data.nama_lengkap' 2>/dev/null)
    GAJI=$(echo "$BODY" | jq -r '.data.gaji_bersih' 2>/dev/null)
    BANK=$(echo "$BODY" | jq -r '.data.mitra' 2>/dev/null)
    REKENING=$(echo "$BODY" | jq -r '.data.nomor_rekening' 2>/dev/null)
    KANTOR=$(echo "$BODY" | jq -r '.data.nama_kantor' 2>/dev/null)
    STATUS=$(echo "$BODY" | jq -r '.data.status_dapem' 2>/dev/null)
    
    echo "5. Parsed Data:"
    echo "---"
    echo "Nama: $NAMA"
    echo "NOPEN: $NOPEN"
    echo "Gaji Bersih: Rp $(echo $GAJI | sed ':a;s/\B[0-9]\{3\}\>/,&/;ta')"
    echo "Bank: $BANK"
    echo "No. Rekening: $REKENING"
    echo "Kantor: $KANTOR"
    if [ "$STATUS" = "13" ]; then
        echo "Status: Aktif"
    else
        echo "Status: Tidak Aktif"
    fi
    echo "---"
else
    echo "❌ ERROR!"
    echo "HTTP Code: $HTTP_CODE"
fi

echo ""
echo "============================================================"
