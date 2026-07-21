#!/bin/bash

# Made Across India Integration Test Script
# This script tests the backend API for MAI real sellers integration

echo "🧪 Testing MAI Real Sellers Integration"
echo "======================================="
echo ""

# Check if backend is running
echo "📡 Checking backend health..."
HEALTH=$(curl -s http://localhost:4000/api/health 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Backend is not running on http://localhost:4000"
    echo "   Please start the backend first:"
    echo "   cd everything/backend && npm start"
    exit 1
fi

echo "✅ Backend is running"
echo "$HEALTH" | grep -q "ok" && echo "   Status: OK"
echo ""

# Test MAI sellers endpoint
echo "🗺️  Fetching real sellers from /api/mai/sellers..."
RESPONSE=$(curl -s http://localhost:4000/api/mai/sellers)

if [ $? -ne 0 ]; then
    echo "❌ Failed to fetch sellers"
    exit 1
fi

# Check if response is valid JSON
echo "$RESPONSE" | jq . > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Invalid JSON response"
    echo "$RESPONSE"
    exit 1
fi

# Count sellers
SELLER_COUNT=$(echo "$RESPONSE" | jq '.sellers | length')

echo "✅ API response valid"
echo "   Real sellers found: $SELLER_COUNT"
echo ""

if [ "$SELLER_COUNT" -eq 0 ]; then
    echo "⚠️  No real sellers found!"
    echo "   This means either:"
    echo "   1. No sellers have completed onboarding, or"
    echo "   2. No sellers have listed products yet"
    echo ""
    echo "   To test with sample data, run:"
    echo "   cd everything/backend && node test-seed-seller.js"
    echo ""
else
    echo "📋 Seller Details:"
    echo "$RESPONSE" | jq -r '.sellers[] | "   - \(.name) (\(.id)) from \(.city), \(.state) - \(.products | length) products"'
    echo ""
    
    # Show first seller in detail
    echo "🔍 First seller detail:"
    echo "$RESPONSE" | jq '.sellers[0]' | head -20
    echo "   ..."
fi

echo ""
echo "✅ Integration test complete!"
echo ""
echo "Next steps:"
echo "1. Open MAI frontend: MYNTRA-CUSTOMER-SIDE/made-across-india/index.html"
echo "2. Check browser console for: '📍 Loaded X real sellers...'"
echo "3. Real sellers should appear on the map"
