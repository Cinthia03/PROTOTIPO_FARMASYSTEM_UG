import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'

import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,          
    MatFormFieldModule      
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  usuario = ''
  contrasena = ''
  error = ''

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login() {
    // 1. Agrupamos los datos del formulario en un objeto limpio
    const losDatos = {
      usuario: this.usuario,
      contrasena: this.contrasena
    };

    // 2. Hacemos la petición POST apuntando a la url del environment
    this.http.post<any>(`${environment.apiUrl}/login`, losDatos).subscribe({
      next: (res) => {
        // Guardamos la sesión si todo sale bien
        localStorage.setItem(
          'usuario',
          JSON.stringify({
            id: res.id,
            usuario: res.usuario,
            nombre: res.nombre,
            rol: res.rol
          })
        );
        
        // Redirección
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        // Manejo del error en pantalla
        this.error = err.error?.message || 'Error de conexión';
      }
    });
  }
}