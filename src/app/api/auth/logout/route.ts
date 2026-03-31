export async function POST(req: Request) {
  // For JWT-based auth, logout is primarily handled on the client side
  // by removing the token from localStorage
  // This endpoint can be used for additional server-side cleanup if needed
  
  return new Response(JSON.stringify({ message: 'Logged out successfully' }), { status: 200 });
} 