#!/bin/bash

echo "🧪 Testing ValidationInterceptor with Problem Details"
echo "=================================================="

# Start the server in background if not running
echo "Starting development server..."
npm run start:dev &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo ""
echo "📝 Test 1: Valid request body"
echo "------------------------------"
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123"
  }' \
  | jq '.'

echo ""
echo "🚫 Test 2: Missing request body"
echo "--------------------------------"
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "❌ Test 3: Invalid email"
echo "-------------------------"
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123"
  }' \
  | jq '.'

echo ""
echo "⚠️  Test 4: Missing required fields"
echo "------------------------------------"
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John"
  }' \
  | jq '.'

# Stop the server
kill $SERVER_PID

echo ""
echo "✅ Validation tests completed!"
