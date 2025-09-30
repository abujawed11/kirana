import * as SecureStore from 'expo-secure-store';

export async function debugAuth() {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    const expiry = await SecureStore.getItemAsync('auth_token_expiry');
    const user = await SecureStore.getItemAsync('auth_user');

    console.log('=== AUTH DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('Expiry:', expiry);
    console.log('User data:', user);

    if (expiry) {
      const expiryDate = new Date(expiry);
      const now = new Date();
      console.log('Token expired:', now >= expiryDate);
      console.log('Expiry date:', expiryDate);
      console.log('Current date:', now);
    }

    console.log('==================');

    return {
      hasToken: !!token,
      token: token?.substring(0, 20) + '...',
      expiry,
      user: user ? JSON.parse(user) : null,
      isExpired: expiry ? new Date() >= new Date(expiry) : false
    };
  } catch (error) {
    console.error('Debug auth error:', error);
    return null;
  }
}

export async function testApiConnection() {
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.20.2.78:5000';

  try {
    console.log('=== API CONNECTION TEST ===');
    console.log('Testing URL:', `${BASE_URL}/health`);

    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', data);
    console.log('==========================');

    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error: error.message };
  }
}

export async function testDatabaseConnection() {
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.20.2.78:5000';

  try {
    console.log('=== DATABASE CONNECTION TEST ===');
    console.log('Testing URL:', `${BASE_URL}/debug/db`);

    const response = await fetch(`${BASE_URL}/debug/db`);
    const data = await response.json();

    console.log('Database status:', response.status);
    console.log('Database info:', data);
    console.log('===============================');

    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error: error.message };
  }
}

export async function testImageUploadEndpoint() {
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.20.2.78:5000';

  try {
    console.log('=== IMAGE UPLOAD ENDPOINT TEST ===');

    // First check if the endpoint exists by making an OPTIONS request
    const optionsUrl = `${BASE_URL}/products/upload-images`;
    console.log('Testing OPTIONS for:', optionsUrl);

    const optionsResponse = await fetch(optionsUrl, { method: 'OPTIONS' });
    console.log('OPTIONS response status:', optionsResponse.status);

    // Try to make a POST request without files to see the error
    const postUrl = `${BASE_URL}/products/upload-images`;
    console.log('Testing POST for:', postUrl);

    const token = await import('expo-secure-store').then(SecureStore =>
      SecureStore.getItemAsync('auth_token')
    );

    const postResponse = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: new FormData(), // Empty FormData
    });

    const responseText = await postResponse.text();
    console.log('POST response status:', postResponse.status);
    console.log('POST response text:', responseText);
    console.log('================================');

    return {
      success: true,
      options: { status: optionsResponse.status },
      post: { status: postResponse.status, text: responseText }
    };
  } catch (error) {
    console.error('Image upload endpoint test failed:', error);
    return { success: false, error: error.message };
  }
}