import { Component, inject, computed } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CineService } from '../../services/cine.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  cineService = inject(CineService);
  sanitizer = inject(DomSanitizer);
  selectedCine = this.cineService.selectedCine;
  movies = this.cineService.movies;

  safeTrailers = computed((): SafeResourceUrl[] => {
    return this.movies().slice(7,12).map(movie => {
      const trailerUrl = movie.trailer || '';
      if (!trailerUrl) {
        return this.sanitizer.bypassSecurityTrustResourceUrl('');
      }
      const videoIdMatch = trailerUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      if (!videoId) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(trailerUrl);
      }
      const baseUrl = trailerUrl.split('/embed/')[0];
      const params = `autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
      const autoplayUrl = `${baseUrl}/embed/${videoId}?${params}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(autoplayUrl);
    });
  });

  get sliderMovies() {
    return this.movies().slice(7, 12); // slider movies
  }

  get posterGroups() {
    const estrenoMovies = this.movies().slice(0, 7);
    const groups = [];
    for (let i = 0; i < estrenoMovies.length; i += 5) {
      groups.push(estrenoMovies.slice(i, i + 5));
    }
    return groups;
  }

  get estrenoMovies() {
    return this.movies().slice(0, 2);
  }

  get upcomingMovies() {
    // Exclude used movies: posterGroups(0-7), sliderMovies(7-12), estrenoMovies(subset)
    return this.movies().slice(12);
  }

  clearCine() {
    this.cineService.selectedCine.set(null);
  }
}
