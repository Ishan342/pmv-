import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase-server';
export async function GET(request:NextRequest){
 const code=new URL(request.url).searchParams.get('code');
 if(code){const supabase=await getServerClient();const {error}=await supabase.auth.exchangeCodeForSession(code); if(!error){const requested=new URL(request.url).searchParams.get('next');const path=requested==='/auth/reset'?'/auth/reset':'/dashboard';return NextResponse.redirect(new URL(path,request.url));}}
 return NextResponse.redirect(new URL('/login?error=auth',request.url));
}
