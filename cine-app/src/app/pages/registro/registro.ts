import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  nombreCompleto = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async onRegister() {
    if (!this.nombreCompleto || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, llena todos los campos.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { data, error } = await this.supabaseService.signUp(this.email, this.password);

      if (error) {
        throw error;
      }

      // If successful, show success message or redirect
      this.successMessage = '¡Registro exitoso! Puedes iniciar sesión ahora.';
      
      // Optionally redirect after a few seconds:
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (error: any) {
      this.errorMessage = error.message || 'Error al crear la cuenta.';
      console.error('Registration error:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Forzar actualización de la vista
    }
  }
}
