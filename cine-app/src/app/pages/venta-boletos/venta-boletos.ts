import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { CineService } from '../../services/cine.service';

@Component({
  selector: 'app-venta-boletos',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './venta-boletos.html',
  styleUrl: './venta-boletos.css',
})
export class VentaBoletos {
  supabaseService = inject(SupabaseService);
  cineService = inject(CineService);

  rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  columns = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  
  ticketPrice = 85.00; // Constante precio de boleto
  selectedSeats: Set<string> = new Set();
  occupiedSeats: Set<string> = new Set(['C5', 'C6', 'D10', 'D11', 'F7', 'F8', 'F9']); // Mockeando ocupados
  wheelchairSeats: Set<string> = new Set(['K1', 'K14']); // Mockeando espacios especiales
  
  getSeatStatus(row: string, col: number): string {
    const seatId = `${row}${col}`;
    if (this.occupiedSeats.has(seatId)) return 'occupied';
    if (this.wheelchairSeats.has(seatId)) return 'wheelchair';
    if (this.selectedSeats.has(seatId)) return 'selected';
    return 'available';
  }

  toggleSeat(row: string, col: number) {
    const seatId = `${row}${col}`;
    
    // No permitir seleccionar asientos ocupados
    if (this.occupiedSeats.has(seatId)) {
        return;
    }

    if (this.selectedSeats.has(seatId)) {
      this.selectedSeats.delete(seatId);
    } else {
      if (this.selectedSeats.size >= 10) {
        alert('Solo puedes seleccionar un máximo de 10 asientos por transacción.');
        return;
      }
      this.selectedSeats.add(seatId);
    }
  }

  get selectedSeatsArray(): string[] {
    return Array.from(this.selectedSeats).sort((a, b) => {
        const rowA = a.charAt(0);
        const rowB = b.charAt(0);
        if (rowA !== rowB) return rowA.localeCompare(rowB);
        const colA = parseInt(a.substring(1));
        const colB = parseInt(b.substring(1));
        return colA - colB;
    });
  }

  get totalAmount() {
    return this.selectedSeats.size * this.ticketPrice;
  }

  async confirmarCompra() {
    if (this.selectedSeats.size === 0) return;

    const compra = {
      user_id: 'usuario_invitado', // ID temporal de prueba
      pelicula_id: '12345', // En un futuro, esto vendrá dinámicamente de la película seleccionada
      pelicula_titulo: 'Cumbres Borrascosas', 
      asientos: Array.from(this.selectedSeats),
      total: this.totalAmount,
      fecha_funcion: 'Miercoles 19, 09:45 pm',
      cine: 'Galerías Pachuca',
      sala: '5',
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await this.supabaseService.registrarCompra(compra);
      
      if (error) throw error;

      alert(`¡Compra confirmada! Tus asientos ${this.selectedSeatsArray.join(', ')} han sido reservados.`);
      
      // Mover los seleccionados a ocupados y limpiar seleccionados
      this.selectedSeats.forEach(seat => this.occupiedSeats.add(seat));
      this.selectedSeats.clear();
      
    } catch (err: any) {
      console.error('Error al registrar compra:', err);
      alert('Hubo un problema procesando tu compra. Inténtalo de nuevo.');
    }
  }
}
