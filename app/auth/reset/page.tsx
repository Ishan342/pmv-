'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {getBrowserClient} from '@/lib/supabase-browser';
export default function Reset(){const [pwd,setPwd]=useState('');const[message,setMessage]=useState('');const router=useRouter();async function submit(e:React.FormEvent){e.preventDefault();const {error}=await getBrowserClient().auth.updateUser({password:pwd});if(error)setMessage(error.message);else{setMessage('Password changed.');router.push('/dashboard')}}return <main className="gate"><div className="gate-card"><div className="brand">GREEN CONCRETE PMV</div><h1>Choose a new password</h1><form onSubmit={submit}><input type="password" minLength={8} required placeholder="New password (8+ characters)" value={pwd} onChange={e=>setPwd(e.target.value)} style={{padding:12,width:'100%',marginBottom:15}}/><button className="primary">Update password</button></form><p>{message}</p></div></main>}
