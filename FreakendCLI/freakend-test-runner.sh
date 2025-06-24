#!/bin/bash

echo "=============================="
echo "🧪 Freakend CLI Auto Test Run"
echo "=============================="
TIMESTAMP=$(date)
echo "🕒 $TIMESTAMP"

# Clear & Init
rm -rf test-app
mkdir test-app && cd test-app

# Simulate CLI from local source
node ../bin/fxp.js init
node ../bin/fxp.js add auth - node-express

# Inject auth into freakend.server.js
node ../utils/injectToFreakendServer.js auth

# Run test server
node freakend.server.js &
PID=$!
sleep 4

echo "🔍 Testing /api/auth/login"
curl -s -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com", "password":"pass"}' > auth_output.json

if grep -q "token" auth_output.json; then
  echo "✅ LOGIN TEST PASSED"
else
  echo "❌ LOGIN TEST FAILED"
  cat auth_output.json
fi

# Kill server
kill $PID
