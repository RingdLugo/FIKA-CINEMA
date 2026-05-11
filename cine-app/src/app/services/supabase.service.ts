import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey as string
  );

  get client() {
    return this.supabase;
  }

  // --- Autenticación ---

  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signInWithOAuth(provider: 'facebook' | 'google' /* Instagram uses Facebook/Meta for OAuth usually, but we can type as string if needed, let's just accept provider */) {
    return await this.supabase.auth.signInWithOAuth({
      provider: provider as any,
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  // --- Compras ---

  async registrarCompra(compra: any) {
    return await this.supabase
      .from('compras')
      .insert([compra]);
  }

  async obtenerHistorialCompras(userId: string) {
    return await this.supabase
      .from('compras')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }
}
