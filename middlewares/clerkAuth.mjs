const { Clerk } = require('@clerk/clerk-sdk-node');

const clerk = new Clerk({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authorization header missing or invalid',
        code: 'MISSING_AUTH_HEADER'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Token not provided',
        code: 'MISSING_TOKEN'
      });
    }

    const session = await clerk.verifyToken(token);
    if (!session?.sub) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    req.auth = {
      userId: session.sub,
      sessionId: session.session_id,
      metadata: session.user_metadata || {}
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error?.errors?.[0]?.code === 'token_invalid') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }

    res.status(500).json({ 
      error: 'Internal authentication error',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
};

module.exports = {
  requireAuth,
  clerkInstance: clerk 
};