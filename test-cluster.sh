#!/bin/bash

BASE_URL="http://localhost:4000/api/users"

echo "1. Creating a user (POST to localhost:4000/api/users)"
USER_DATA='{"username":"TestUser","age":30,"hobbies":["reading","coding"]}'
CREATE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$USER_DATA" ${BASE_URL} -w "\n%{http_code}")
BODY=$(echo "$CREATE_RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ "$HTTP_CODE" != "201" ]; then
    echo "Failed to create user. HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

echo "User created with ID: $USER_ID"

echo "2. Getting the user (GET from localhost:4000/api/users/$USER_ID)"
GET_RESPONSE=$(curl -s -X GET ${BASE_URL}/$USER_ID -w "\n%{http_code}")
BODY=$(echo "$GET_RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$GET_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" != "200" ]; then
    echo "Failed to get user. HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

echo "User retrieved successfully"
echo "Response: $BODY"

echo "3. Deleting the user (DELETE to localhost:4000/api/users/$USER_ID)"
DELETE_RESPONSE=$(curl -s -X DELETE ${BASE_URL}/$USER_ID -w "\n%{http_code}")
BODY=$(echo "$DELETE_RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" != "204" ]; then
    echo "Failed to delete user. HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

echo "User deleted successfully"

echo "4. Trying to get the deleted user (GET from localhost:4000/api/users/$USER_ID)"
GET_DELETED_RESPONSE=$(curl -s -X GET ${BASE_URL}/$USER_ID -w "\n%{http_code}")
BODY=$(echo "$GET_DELETED_RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$GET_DELETED_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" != "404" ]; then
    echo "Expected 404, but got $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

echo "Test passed: Got 404 for deleted user"

echo "All tests passed successfully!"