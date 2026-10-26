import { Routes } from '@angular/router';

import { InicioPage } from './pages/inicio/inicio';
import { HabitacionesPage } from './pages/habitaciones/habitaciones';
import { ReservasPage } from './pages/reservas/reservas';
import { ConsultarReservaPage } from './pages/consultar-reserva/consultar-reserva';
import { ContactoPage } from './pages/contacto/contacto';

import { LoginPage } from './pages/auth/login/login';
import { RegistroPage } from './pages/auth/registro/registro';
import { MisReservasPage } from './pages/mis-reservas/mis-reservas';

import { DashboardPage } from './pages/admin/dashboard/dashboard';
import { HabitacionesAdminPage } from './pages/admin/habitaciones/habitaciones-admin';
import { ReservasAdminPage } from './pages/admin/reservas/reservas-admin';
import { EstanciasAdminPage } from './pages/admin/estancias/estancias-admin';
import { PagosAdminPage } from './pages/admin/pagos/pagos-admin';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    component: InicioPage,
    title: 'Inicio | Siball Hotel'
  },
  {
    path: 'habitaciones',
    component: HabitacionesPage,
    title: 'Habitaciones | Siball Hotel'
  },

  // La búsqueda de habitaciones sigue siendo pública.
  {
    path: 'reservas',
    component: ReservasPage,
    title: 'Reservar | Siball Hotel'
  },

  {
    path: 'login',
    component: LoginPage,
    title: 'Iniciar sesión | Siball Hotel'
  },
  {
    path: 'registro',
    component: RegistroPage,
    title: 'Crear cuenta | Siball Hotel'
  },
  {
    path: 'mis-reservas',
    component: MisReservasPage,
    canActivate: [authGuard],
    title: 'Mis reservas | Siball Hotel'
  },
  {
    path: 'consultar-reserva',
    component: ConsultarReservaPage,
    canActivate: [authGuard],
    title: 'Consultar reserva | Siball Hotel'
  },
  {
    path: 'contacto',
    component: ContactoPage,
    title: 'Contacto | Siball Hotel'
  },

  {
    path: 'admin',
    component: DashboardPage,
    canActivate: [adminGuard],
    title: 'Administración | Siball Hotel'
  },
  {
    path: 'admin/habitaciones',
    component: HabitacionesAdminPage,
    canActivate: [adminGuard],
    title: 'Administrar habitaciones | Siball Hotel'
  },
  {
    path: 'admin/reservas',
    component: ReservasAdminPage,
    canActivate: [adminGuard],
    title: 'Administrar reservas | Siball Hotel'
  },
  {
    path: 'admin/estancias',
    component: EstanciasAdminPage,
    canActivate: [adminGuard],
    title: 'Administrar estancias | Siball Hotel'
  },
  {
    path: 'admin/pagos',
    component: PagosAdminPage,
    canActivate: [adminGuard],
    title: 'Pagos y comprobantes | Siball Hotel'
  },

  {
    path: '**',
    redirectTo: 'inicio'
  }
];