import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CineService } from '../../services/cine.service';

@Component({
  selector: 'app-encontrar-cine',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './encontrar-cine.html',
  styleUrl: './encontrar-cine.css',
})
export class EncontrarCine {
  private router = inject(Router);
  private cineService = inject(CineService);

  readonly datos = {
    cdmx: {
        "Ciudad de México": [
            "FIKA Plaza PeriSur",
            "FIKA Reforma 222",
            "FIKA Parque Delta"
        ]
    },
    jalisco: {
        "Guadalajara": [
            "FIKA Andares",
            "FIKA Galerías Guadalajara"
        ],
        "Zapopan": [
            "FIKA Plaza Patria"
        ]
    },
    nuevoleon: {
        "Monterrey": [
            "FIKA Paseo La Fe",
            "FIKA Galerías Monterrey"
        ]
    },
    edomex: {
        "Toluca": [
            "FIKA Galerías Toluca"
        ],
        "Naucalpan": [
            "FIKA Satélite"
        ]
    },
    puebla: {
        "Puebla": [
            "FIKA Angelópolis",
            "FIKA Explanada Puebla"
        ]
    }
  } as const;

  get estados() {
    return Object.entries(this.datos).map(([id, ciudades]) => ({ id, nombre: id.replace(/^\w/, c => c.toUpperCase()) }));
  }

  ciudades: string[] = [];
  cines: string[] = [];
  estadoSeleccionado = '';
  ciudadSeleccionada = '';
  cineSeleccionado = '';
  mensajeError = '';
  mensajeExito = '';

  onEstadoChange() {
    const ciudadesObj = this.datos[this.estadoSeleccionado as keyof typeof this.datos];
    this.ciudades = ciudadesObj ? Object.keys(ciudadesObj) : [];
    this.ciudadSeleccionada = '';
    this.cines = [];
    this.cineSeleccionado = '';
  }

  onCiudadChange() {
    const estado = this.estadoSeleccionado as keyof typeof this.datos;
    const ciudadesObj = this.datos[estado];
    const cines = ciudadesObj?.[this.ciudadSeleccionada as keyof typeof ciudadesObj] || [];
    this.cines = Array.isArray(cines) ? cines : [];
    this.cineSeleccionado = '';
  }

  onSubmit() {
    if (!this.cineSeleccionado) {
      this.mensajeError = 'Por favor selecciona un cine';
      this.mensajeExito = '';
      return;
    }
    this.cineService.selectedCine.set(this.cineSeleccionado);
    this.mensajeError = '';
    this.mensajeExito = '¡Cine seleccionado! Redirigiendo...';
    setTimeout(() => {
      this.router.navigate(['/inicio']);
    }, 1000);
  }
}
