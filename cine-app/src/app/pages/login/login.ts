import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa tu correo y contraseña.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { data, error } = await this.supabaseService.signIn(this.email, this.password);

      if (error) {
        throw error;
      }

      if (data.user) {
        // Login successful, redirect to home
        this.router.navigate(['/inicio']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión.';
      console.error('Login error:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Forzar actualización de la vista
    }
  }

  async loginWithOAuth(provider: 'facebook') {
    try {
      const { error } = await this.supabaseService.signInWithOAuth(provider);
      if (error) throw error;
    } catch (error: any) {
      this.errorMessage = error.message || `Error al iniciar sesión con ${provider}.`;
      console.error(`${provider} Login error:`, error);
      this.cdr.detectChanges(); // Forzar actualización de la vista
    }
  }
}
