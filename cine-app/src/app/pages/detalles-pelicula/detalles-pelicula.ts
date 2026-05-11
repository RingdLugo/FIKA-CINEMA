import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { CineService, Movie, Schedules } from '../../services/cine.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-detalles-pelicula',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './detalles-pelicula.html',
  styleUrl: './detalles-pelicula.css',
})
export class DetallesPelicula {
  cineService = inject(CineService);
  route = inject(ActivatedRoute);
  sanitizer = inject(DomSanitizer);

  paramMap = toSignal(this.route.paramMap, { initialValue: null! });
  movieId = computed(() => this.paramMap()?.get('id') || 'cumbres');
  currentMovie = computed(() => this.cineService.getMovieById(this.movieId()));
  safeDescription = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.currentMovie()?.description || ''));
  safeTrailer = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.currentMovie()?.trailer || ''));

  selectedDay = signal('lunes');
  selectedTime = signal('');

  days = [
    { id: 'lunes', name: 'LUN 17 FEB' },
    { id: 'martes', name: 'MAR 18 FEB' },
    { id: 'miercoles', name: 'MIÉ 19 FEB' },
    { id: 'jueves', name: 'JUE 20 FEB' },
    { id: 'viernes', name: 'VIE 21 FEB' },
    { id: 'sabado', name: 'SÁB 22 FEB' },
    { id: 'domingo', name: 'DOM 23 FEB' }
  ];

  genericSchedules: Record<string, Schedules> = {
    lunes: {
      espanol: ['10:00 AM', '1:00 PM', '4:30 PM', '8:00 PM'],
      sub: ['12:30 PM', '6:15 PM'],
      regular: ['9:00 AM', '11:30 AM', '2:00 PM', '5:00 PM']
    },
    martes: {
      espanol: ['11:00 AM', '2:30 PM', '6:00 PM', '9:15 PM'],
      sub: ['1:00 PM', '7:00 PM'],
      regular: []
    },
    miercoles: {
      espanol: ['9:45 AM', '12:15 PM', '5:00 PM', '7:45 PM'],
      sub: ['2:00 PM', '8:15 PM'],
      regular: []
    },
    jueves: {
      espanol: ['10:30 AM', '3:00 PM', '6:45 PM', '9:30 PM'],
      sub: ['12:45 PM', '7:30 PM'],
      regular: []
    },
    viernes: {
      espanol: ['10:00 AM', '1:45 PM', '5:30 PM', '10:00 PM'],
      sub: ['3:15 PM', '9:45 PM'],
      regular: []
    },
    sabado: {
      espanol: ['9:00 AM', '12:00 PM', '4:00 PM', '8:30 PM'],
      sub: ['1:30 PM', '6:30 PM'],
      regular: []
    },
    domingo: {
      espanol: ['10:15 AM', '2:00 PM', '5:45 PM', '7:30 PM'],
      sub: ['12:00 PM', '6:00 PM'],
      regular: []
    }
  };

  selectDay(dayId: string) {
    this.selectedDay.set(dayId);
    this.selectedTime.set('');
  }

  selectTime(time: string) {
    this.selectedTime.set(time);
  }

  currentSchedule = computed(() => {
    if (this.currentMovie()?.isUpcoming) {
      return { espanol: [], sub: [], regular: [] };
    }
    const day = this.selectedDay();
    const movieSchedules = this.currentMovie()?.schedules?.[day];
    return movieSchedules || this.genericSchedules[day] || { espanol: [], sub: [], regular: [] };
  });
}
