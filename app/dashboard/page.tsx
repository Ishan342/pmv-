import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabase-server';
import CommandCenter from '@/components/command-center';
export const dynamic='force-dynamic';
export default async function Dashboard(){
 const db=await getServerClient(); const {data:{user}}=await db.auth.getUser();
 if(!user)redirect('/login');
 const {data:profile}=await db.from('profiles').select('user_id,display_name,role,enabled').eq('user_id',user.id).single();
 if(!profile?.enabled)return <main className="gate"><div className="gate-card"><div className="brand">GREEN CONCRETE <span>PMV</span></div><h1>Account awaiting approval</h1><p>You are signed in as <b>{user.email}</b>, but an administrator has not granted access yet.</p><p>Your administrator must enable your profile and assign a site (unless you are an admin).</p><form action="/login"><button className="primary">Back to sign in</button></form></div></main>;
 return <CommandCenter profile={profile} email={user.email||''}/>;
}
