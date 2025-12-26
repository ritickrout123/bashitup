#!/usr/bin/env node

/**
 * Debug script to test authentication endpoints
 * Usage: node scripts/debug-auth.js [base-url]
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';

async function testAuth() {
  console.log(`Testing authentication on: ${baseUrl}`);
  
  try {
    // Test login endpoint
    console.log('\n1. Testing login endpoint...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!'
      })
    });
    
    console.log('Login Status:', loginResponse.status);
    console.log('Login Headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));
    
    // Extract cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie Header:', cookies);
    
    // Test /me endpoint
    console.log('\n2. Testing /me endpoint...');
    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      credentials: 'include',
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    console.log('Me Status:', meResponse.status);
    const meData = await meResponse.json();
    console.log('Me Response:', JSON.stringify(meData, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();