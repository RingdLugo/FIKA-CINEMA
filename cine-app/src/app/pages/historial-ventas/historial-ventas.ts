import { Component, inject, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CurrencyPipe, DatePipe, SlicePipe, UpperCasePipe } from '@angular/common';

export interface Compra {
  id: string;
  pelicula_titulo: string;
  fecha_funcion: string;
  asientos: string[];
  total: number | string;
  created_at: string;
}

@Component({
  selector: 'app-historial-ventas',
  imports: [CurrencyPipe, DatePipe, SlicePipe, UpperCasePipe],
  templateUrl: './historial-ventas.html',
  styleUrl: './historial-ventas.css',
})
export class HistorialVentas implements OnInit {
  supabaseService = inject(SupabaseService);

  todasLasCompras: Compra[] = [];
  
  compras = signal<Compra[]>([]);
  totalVentas = signal<number>(0);
  boletosVendidos = signal<number>(0);
  montoTotal = signal<number>(0);

  filtroTipo = signal<'day' | 'month' | 'year'>('day');
  fechaFiltro = signal<string>(new Date().toISOString().split('T')[0]);

  ngOnInit() {
    this.cargarCompras();
  }

  async cargarCompras() {
    const { data, error } = await this.supabaseService.obtenerTodasLasCompras();
    
    if (error) {
      console.error('Error al cargar el historial:', error);
      return;
    }

    if (data) {
      this.todasLasCompras = data;
      this.aplicarFiltro();
    }
  }

  setFiltro(tipo: 'day' | 'month' | 'year') {
    this.filtroTipo.set(tipo);
    this.aplicarFiltro();
  }

  onFechaChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.fechaFiltro.set(input.value);
      this.aplicarFiltro();
    }
  }

  aplicarFiltro() {
    const tipo = this.filtroTipo();
    const fechaSelect = this.fechaFiltro(); // YYYY-MM-DD
    
    const year = fechaSelect.substring(0, 4);
    const month = fechaSelect.substring(5, 7);
    const day = fechaSelect.substring(8, 10);

    const filtradas = this.todasLasCompras.filter(compra => {
      // compra.created_at formato esperado: YYYY-MM-DDTHH:mm:ss...
      const compraDate = compra.created_at;
      if (!compraDate) return false;

      const cYear = compraDate.substring(0, 4);
      const cMonth = compraDate.substring(5, 7);
      const cDay = compraDate.substring(8, 10);

      if (tipo === 'year') {
        return cYear === year;
      } else if (tipo === 'month') {
        return cYear === year && cMonth === month;
      } else {
        // day
        return cYear === year && cMonth === month && cDay === day;
      }
    });

    this.compras.set(filtradas);
    this.calcularTotales(filtradas);
  }

  calcularTotales(comprasData: Compra[]) {
    this.totalVentas.set(comprasData.length);
    
    let totalBoletos = 0;
    let totalMonto = 0;

    comprasData.forEach(compra => {
      totalBoletos += (compra.asientos ? compra.asientos.length : 0);
      totalMonto += typeof compra.total === 'string' ? parseFloat(compra.total) : compra.total;
    });

    this.boletosVendidos.set(totalBoletos);
    this.montoTotal.set(totalMonto);
  }
}
