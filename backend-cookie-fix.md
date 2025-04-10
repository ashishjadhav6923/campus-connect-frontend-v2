# Backend Cookies Configuration Guide

To ensure that cookies are properly set and sent between your frontend and backend when they're on different domains (cross-origin), you need to make the following changes to your Express.js backend:

## 1. Update CORS Configuration

Ensure your CORS settings are correctly configured to allow credentials:

```javascript
// In your main Express app file (app.js or server.js)
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// CORS configuration for cross-origin cookie support
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.com'],
  credentials: true, // This is crucial for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Make sure cookie-parser is used
app.use(cookieParser());
```

## 2. Set Cookies with the Right Flags

When setting cookies in your authentication routes, use these flags:

```javascript
// In your auth controller or route handler
app.post('/api/auth/login', async (req, res) => {
  try {
    // Your authentication logic...
    
    // When setting the cookie, use these options:
    res.cookie('authToken', token, {
      httpOnly: true, // Prevents JavaScript access
      secure: true,   // Requires HTTPS
      sameSite: 'none', // Essential for cross-origin requests
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration (e.g., 24 hours)
      path: '/'       // Available on all paths
    });
    
    return res.status(200).json({
      statusCode: 200,
      message: "User logged In Successfully",
      data: { user: userData }
    });
  } catch (error) {
    // Error handling...
  }
});
```

## 3. Verify Route for Authentication Check

Create a verify endpoint that checks if the user is authenticated:

```javascript
app.get('/api/auth/verify', (req, res) => {
  try {
    // Get the token from cookies
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({ 
        statusCode: 401, 
        message: 'Authentication failed: No token provided',
        data: null 
      });
    }
    
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          statusCode: 401, 
          message: 'Authentication failed: Invalid token',
          data: null 
        });
      }
      
      // You might want to fetch the user from the database here
      // and remove sensitive information
      
      return res.status(200).json({
        statusCode: 200,
        message: 'Token verified successfully',
        data: { user: decoded.user }
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      statusCode: 500, 
      message: 'Server error',
      data: null 
    });
  }
});
```

## 4. Logout Route to Clear Cookies

```javascript
app.post('/api/auth/logout', (req, res) => {
  // Clear the auth cookie
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  });
  
  return res.status(200).json({
    statusCode: 200,
    message: 'Logged out successfully',
    data: null
  });
});
```

## 5. Testing Cross-Origin Cookies

To test if your cookies are working correctly:

1. Ensure both frontend and backend are running on different domains/ports
2. Log in through the frontend
3. Check if cookies are set in the browser's dev tools (Application tab in Chrome)
4. Try accessing a protected route to see if the cookie is sent
5. Use the CookieDebugger component we added to the frontend

## Common Issues and Solutions

1. **Cookies not being set**: 
   - Ensure `credentials: true` is set in CORS
   - Make sure `sameSite: 'none'` and `secure: true` are used
   - Ensure you're using HTTPS in production

2. **Cookies not being sent**:
   - Verify `withCredentials: true` is set in frontend Axios requests
   - Check that your cookie hasn't expired

3. **CORS errors**:
   - Ensure all required headers are configured properly
   - Double-check that your frontend origin is in the allowed origins list

4. **Browser restrictions**:
   - Chrome and Firefox have stricter rules for cross-origin cookies
   - Try using a different browser for testing if issues persist

If you still have issues after implementing these changes, please provide more specific error messages from both the frontend console and backend logs. 