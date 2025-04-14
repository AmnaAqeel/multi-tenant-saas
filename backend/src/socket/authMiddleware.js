import jwt from 'jsonwebtoken';

// Middleware to verify JWT for socket connections
export const verifySocketToken = (socket, next) => {

  console.log("🔐 Socket middleware triggered");
  // Extract token from socket handshake query
  const token = socket.handshake.auth.token; // <-- Remember: This comes from front-end in socket connection
  console.log("📦 Received token:", token);

  
  if (!token) {
    console.log("❌ No token received");
    // If no token, reject connection
    return next(new Error('Authentication error: Token not provided.'));
  }
  
  // Verify the token using JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Token verification failed:", err.message);
      // If token is invalid or expired
      return next(new Error('Authentication error: Invalid or expired token.'));
    }
    
    console.log("✅ Token verified:", decoded);
    // Attach decoded user data to socket for later use
    socket.user = decoded;  // You can attach any info you need from the token here
    console.log("socket.user", socket.user)
    
    // Proceed with the connection
    next();
  });
};
