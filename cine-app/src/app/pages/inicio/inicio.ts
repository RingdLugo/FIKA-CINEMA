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

  get allMovies() {
    return this.movies();
  }

  get moviesBySelectedCine() {
    const cine = this.selectedCine();
    if (!cine) {
      // Si no hay cine seleccionado, mostrar todas las películas que NO son próximos estrenos
      return this.movies().filter(m => !m.isUpcoming);
    }
    // Si hay cine, filtrar las que tienen horarios en ese cine
    return this.movies().filter(m => m.schedules && m.schedules[cine] && !m.isUpcoming);
  }

  get groupedMovies() {
    const all = this.moviesBySelectedCine;
    const groups = [];
    for (let i = 0; i < all.length; i += 4) {
      groups.push(all.slice(i, i + 4));
    }
    return groups;
  }

  get availableStates() {
    return this.cineService.locations.map(l => l.state);
  }

  get availableCities() {
    const state = this.cineService.selectedState();
    if (!state) return [];
    const stateData = this.cineService.locations.find(l => l.state === state);
    return stateData ? stateData.cities : [];
  }

  get availableCinesForCity() {
    const cityName = this.cineService.selectedCity();
    const stateName = this.cineService.selectedState();
    if (!stateName || !cityName) return [];
    const stateData = this.cineService.locations.find(l => l.state === stateName);
    const cityData = stateData?.cities.find(c => c.name === cityName);
    return cityData ? cityData.cines : [];
  }

  onStateChange(event: any) {
    this.cineService.selectedState.set(event.target.value);
    this.cineService.selectedCity.set(null);
    this.cineService.selectedCine.set(null);
  }

  onCityChange(event: any) {
    this.cineService.selectedCity.set(event.target.value);
    this.cineService.selectedCine.set(null);
  }

  onCineChange(event: any) {
    this.cineService.selectedCine.set(event.target.value);
  }

  get upcomingMovies() {
    return this.movies().filter(m => m.isUpcoming);
  }

  get preventaMovies() {
    return this.movies().filter(m => m.isPresale);
  }

  clearCine() {
    this.cineService.selectedCine.set(null);
    this.cineService.selectedState.set(null);
    this.cineService.selectedCity.set(null);
  }
}
