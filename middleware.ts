import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function middleware(request: NextRequest) {
 let response = NextResponse.next({ request });
 const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
  cookies: {
   getAll() { return request.cookies.getAll(); },
   setAll(cookies) { cookies.forEach(({name,value})=>request.cookies.set(name,value)); response = NextResponse.next({request}); cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options)); }
  }
 });
 // Server validates auth on protected routes; middleware refreshes cookies.
 await supabase.auth.getUser();
 return response;
}
export const config = { matcher: ['/dashboard/:path*','/login'] };
