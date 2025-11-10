import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { user, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');

  if (!user) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Connexion</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="ton@email.com"
          className="w-full px-3 py-2 border rounded"/>
        <button onClick={()=>signIn(email)} className="px-4 py-2 rounded bg-gray-900 text-white">
          Recevoir le lien par email
        </button>
        <p className="text-xs text-gray-500">Vérifie ta boîte mail (Supabase magic link).</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Profil</h2>
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm">Connecté en tant que : <b>{user.email}</b></div>
      </div>
      <button onClick={signOut} className="px-3 py-2 rounded bg-gray-100">Déconnexion</button>
    </section>
  );
}
export default Profile;
