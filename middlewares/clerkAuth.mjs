import { Clerk } from '@clerk/clerk-sdk-node';

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    
    const session = await clerk.verifyToken(token);
    if (!session || !session.sub) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.auth = { 
      userId: session.sub
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Unauthorized' }); 
  }
};