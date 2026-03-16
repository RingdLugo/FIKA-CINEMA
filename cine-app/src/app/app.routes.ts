import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';

import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { AdminPanel } from './pages/admin-panel/admin-panel';
import { DetallesPelicula } from './pages/detalles-pelicula/detalles-pelicula';
import { EncontrarCine } from './pages/encontrar-cine/encontrar-cine';
import { HistorialVentas } from './pages/historial-ventas/historial-ventas';
import { RegistroPelicula } from './pages/registro-pelicula/registro-pelicula';
import { VentaBoletos } from './pages/venta-boletos/venta-boletos';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'admin-panel', component: AdminPanel },
  { path: 'detalles-pelicula/:id', component: DetallesPelicula },
  { path: 'encontrar-cine', component: EncontrarCine },
  { path: 'historial-ventas', component: HistorialVentas },
  { path: 'registro-pelicula', component: RegistroPelicula },
  { path: 'venta-boletos', component: VentaBoletos },
  { path: '**', redirectTo: 'inicio' }
];
