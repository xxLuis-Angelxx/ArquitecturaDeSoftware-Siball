import { Routes } from '@angular/router';

import { InicioPage } from './pages/inicio/inicio';
import { HabitacionesPage } from './pages/habitaciones/habitaciones';
import { ReservasPage } from './pages/reservas/reservas';
import { ConsultarReservaPage } from './pages/consultar-reserva/consultar-reserva';
import { ContactoPage } from './pages/contacto/contacto';

import { DashboardPage } from './pages/admin/dashboard/dashboard';
import { HabitacionesAdminPage } from './pages/admin/habitaciones/habitaciones-admin';
import { ReservasAdminPage } from './pages/admin/reservas/reservas-admin';
import { EstanciasAdminPage } from './pages/admin/estancias/estancias-admin';
import { PagosAdminPage } from './pages/admin/pagos/pagos-admin';

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
  {
    path: 'reservas',
    component: ReservasPage,
    title: 'Reservar | Siball Hotel'
  },
  {
    path: 'consultar-reserva',
    component: ConsultarReservaPage,
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
    title: 'Administración | Siball Hotel'
  },
  {
    path: 'admin/habitaciones',
    component: HabitacionesAdminPage,
    title: 'Administrar habitaciones | Siball Hotel'
  },
  {
    path: 'admin/reservas',
    component: ReservasAdminPage,
    title: 'Administrar reservas | Siball Hotel'
  },
  {
    path: 'admin/estancias',
    component: EstanciasAdminPage,
    title: 'Administrar estancias | Siball Hotel'
  },
  {
    path: 'admin/pagos',
    component: PagosAdminPage,
    title: 'Pagos y comprobantes | Siball Hotel'
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];