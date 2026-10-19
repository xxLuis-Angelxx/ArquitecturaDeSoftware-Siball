import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class ContactoPage {
  nombre = '';
  telefono = '';
  correo = '';
  mensaje = '';

  readonly whatsapp = '51963827663';
  readonly correoHotel = 'reservas@siball-hotel.com';

  enviarConsulta(): void {
    if (
      !this.nombre.trim() ||
      !this.telefono.trim() ||
      !this.mensaje.trim()
    ) {
      return;
    }

    const texto = [
      'Hola, Siball Hotel.',
      '',
      'Deseo realizar una consulta.',
      `Nombre: ${this.nombre.trim()}`,
      `Teléfono: ${this.telefono.trim()}`,
      this.correo.trim() ? `Correo: ${this.correo.trim()}` : '',
      `Mensaje: ${this.mensaje.trim()}`
    ].filter(Boolean).join('\n');

    const url =
      `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(texto)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  limpiarFormulario(): void {
    this.nombre = '';
    this.telefono = '';
    this.correo = '';
    this.mensaje = '';
  }
}