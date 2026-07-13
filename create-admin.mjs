import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) acc[key] = value.join('=').replace(/"/g, '').trim();
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function main() {
  const email = 'admin@bibliophile.com';
  const password = 'Admin!Password@2026';

  console.log('Signing up user...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Auth Error:', authError.message);
    if (authError.message.includes('already registered')) {
      console.log('User already exists, attempting login...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) {
        console.error('Login Error:', loginError.message);
        return;
      }
      console.log('Logged in successfully!');
      await trySetAdmin(loginData.user.id);
    }
    return;
  }

  console.log('Signed up successfully!');
  if (authData.user) {
    await trySetAdmin(authData.user.id);
  }
}

async function trySetAdmin(userId) {
  console.log('Attempting to set admin role...');
  const { data, error } = await supabase
    .from('user_roles')
    .insert([{ user_id: userId, role: 'admin' }])
    .select();

  if (error) {
    console.error('Failed to set role:', error.message);
    console.log('Note: RLS policies might prevent automatic role assignment using anon key.');
  } else {
    console.log('Success! Role set:', data);
  }
}

main();
