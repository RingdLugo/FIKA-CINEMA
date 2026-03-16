import { Injectable, signal } from '@angular/core';

export interface Schedules {
  espanol: string[];
  sub: string[];
  regular: string[];
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  trailer: string;
  description: string;
  director: string;
  actors: string;
  classification: string;
  schedules?: Record<string, Schedules>;
}

@Injectable({
  providedIn: 'root'
})
export class CineService {
  selectedCine = signal<string | null>(null);

  movies = signal<Movie[]>([
    {
      id: 'estreno1',
      title: 'Intensamente 2',
      poster: 'assets/img/estreno1.png',
      trailer: 'https://www.youtube.com/embed/RNynG8dMp5w', // Edit this YT embed URL
      description: 'Riley está en el instituto y sus emociones siguen guiándola en su nueva vida. Dentro de su mente, hay nuevos Problemas: Ansiedad, que quiere planificar todo; Envidia, que está obsesionada con lo que tienen los demás; y Ennui, que está aburrida de todo.',
      director: 'Kelsey Mann',
      actors: 'Amy Poehler, Liza Lapira, Kensington Tallman',
      classification: 'TCB',
      schedules: {
        lunes: { espanol: ['10:00 AM', '1:00 PM', '4:30 PM'], sub: ['12:30 PM'], regular: ['9:00 AM', '5:00 PM'] },
        martes: { espanol: ['11:00 AM', '2:30 PM'], sub: [], regular: [] },
        miercoles: { espanol: ['9:45 AM'], sub: ['2:00 PM'], regular: [] },
        jueves: { espanol: ['10:30 AM'], sub: [], regular: [] },
        viernes: { espanol: ['10:00 AM', '5:30 PM'], sub: [], regular: [] },
        sabado: { espanol: ['9:00 AM', '4:00 PM'], sub: ['1:30 PM'], regular: [] },
        domingo: { espanol: ['10:15 AM'], sub: [], regular: [] }
      }
    },
    {
      id: 'estreno2',
      title: 'La Niña de mis Ojos',
      poster: 'assets/img/estreno2.png',
      trailer: 'https://www.youtube.com/embed/YOUR_TRAILER_ID_HERE', // Edit this YT embed URL
      description: 'Una historia emotiva sobre la conexión entre padres e hijos en tiempos difíciles.',
      director: 'Director Ficticio 2',
      actors: 'Actores Ficticios 2',
      classification: 'TCB',
      schedules: {
        lunes: { espanol: ['1:00 PM', '8:00 PM'], sub: [], regular: [] },
        martes: { espanol: ['6:00 PM'], sub: ['1:00 PM'], regular: [] },
        miercoles: { espanol: [], sub: [], regular: [] },
        jueves: { espanol: [], sub: [], regular: [] },
        viernes: { espanol: ['10:00 PM'], sub: [], regular: [] },
        sabado: { espanol: ['8:30 PM'], sub: [], regular: [] },
        domingo: { espanol: [], sub: [], regular: [] }
      }
    },
    {
      id: 'estreno3',
      title: 'Estreno 3',
      poster: 'assets/img/estreno3.png',
      trailer: 'https://www.youtube.com/embed/YOUR_TRAILER_ID_HERE',
      description: 'Película de estreno con gran expectativa.',
      director: 'Director Ficticio 3',
      actors: 'Actores Ficticios 3',
      classification: 'TCB'
      // No custom schedules, uses fallback
    },
    // Similar for estreno4-7 with varying schedules or none
    {
      id: 'estreno4',
      title: 'Preventa 1',
      poster: 'assets/img/estreno4.png',
      trailer: 'https://www.youtube.com/embed/YOUR_TRAILER_ID_HERE',
      description: 'En preventa, no te la pierdas.',
      director: 'Director Ficticio 4',
      actors: 'Actores Ficticios 4',
      classification: 'TCB'
    },
    {
      id: 'estreno5',
      title: 'Preestreno Especial',
      poster: 'assets/img/estreno5.png',
      trailer: 'https://www.youtube.com/embed/YOUR_TRAILER_ID_HERE',
      description: 'Preestreno exclusivo para fans.',
      director: 'Director Ficticio 5',
      actors: 'Actores Ficticios 5',
      classification: 'TCB'
    },
    {
      id: 'estreno6',
      title: 'Estreno 6',
      poster: 'assets/img/estreno6.png',
      trailer: 'https://www.youtube.com/embed/YOUR_TRAILER_ID_HERE',
      description: 'Otra gran película en cartelera.',
      director: 'Director Ficticio 6',
      actors: 'Actores Ficticios 6',
      classification: 'TCB'
    },
    {
      id: 'estreno7',
      title: 'Estreno 7',
      poster: 'assets/img/estreno7.png',
      trailer: 'https://www.youtube.com/embed/YOUR_TRAILER_ID_HERE',
      description: 'Cierra la semana con acción.',
      director: 'Director Ficticio 7',
      actors: 'Actores Ficticios 7',
      classification: 'TCB'
    },
    {
      id: 'laniñademisojos',
      title: 'La Niña de mis Ojos',
      poster: 'assets/img/laniñademisojos.png',
      trailer: 'https://www.youtube.com/embed/YOUR_TRAILER_ID_HERE',
      description: 'Destacada de la semana, historia impactante.',
      director: 'Director Slider 1',
      actors: 'Actores Slider 1',
      classification: 'TCB'
    },
    {
      id: 'cumbres',
      title: 'Cumbres Borrascosas',
      poster: 'assets/img/cumbres.png',
      trailer: 'https://www.youtube.com/embed/RNynG8dMp5w',
      description: 'Una versión audaz y original de una de las historias de amor más grandes de todos los tiempos. La pasión prohibida se transforma de romántica a obsesiva en una historia épica de deseo, amor y locura.',
      director: 'Emerald Fennell',
      actors: 'Margot Robbie, Jacob Elordi, Owen Cooper',
      classification: 'TCB',
      schedules: {
        lunes: { espanol: ['8:00 PM'], sub: ['6:15 PM'], regular: ['5:00 PM'] },
        martes: { espanol: ['9:15 PM'], sub: ['7:00 PM'], regular: [] },
        miercoles: { espanol: ['7:45 PM'], sub: ['8:15 PM'], regular: [] },
        jueves: { espanol: ['9:30 PM'], sub: ['7:30 PM'], regular: [] },
        viernes: { espanol: ['10:00 PM'], sub: ['9:45 PM'], regular: [] },
        sabado: { espanol: ['8:30 PM'], sub: ['6:30 PM'], regular: [] },
        domingo: { espanol: ['7:30 PM'], sub: ['6:00 PM'], regular: [] }
      }
    },
    {
      id: 'intensamente',
      title: 'Intensamente 2',
      poster: 'assets/img/intensamente.png',
      trailer: 'https://www.youtube.com/embed/RNynG8dMp5w',
      description: 'Riley en el instituto, nuevas emociones como Ansiedad y Ennui.',
      director: 'Kelsey Mann',
      actors: 'Amy Poehler, Liza Lapira',
      classification: 'TCB'
    },
    {
      id: 'scream7',
      title: 'Scream 7',
      poster: 'assets/img/SCREAM7.png',
      trailer: 'https://www.youtube.com/embed/YOUR_TRAILER_ID_HERE',
      description: 'Terror de estreno, nueva entrega de la saga.',
      director: 'Director Terror',
      actors: 'Actores Scream',
      classification: 'TCB'
    },
    {
      id: 'goat',
      title: 'GOAT',
      poster: 'assets/img/goat.png',
      trailer: 'https://www.youtube.com/embed/YOUR_TRAILER_ID_HERE',
      description: 'Película familiar animada.',
      director: 'Director GOAT',
      actors: 'Actores GOAT',
      classification: 'TCB'
    }
  ]);

  getMovieById(id: string) {
    return this.movies().find(movie => movie.id === id) || null;
  }
}
