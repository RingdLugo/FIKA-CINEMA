import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-venta-boletos',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './venta-boletos.html',
  styleUrl: './venta-boletos.css',
})
export class VentaBoletos {
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
}
