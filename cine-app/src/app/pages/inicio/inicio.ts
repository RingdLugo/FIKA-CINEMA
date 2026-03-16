import { Component, inject, computed } from '@angular/core';
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
  selectedCine = this.cineService.selectedCine;
  movies = this.cineService.movies;

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

  clearCine() {
    this.cineService.selectedCine.set(null);
  }
}
