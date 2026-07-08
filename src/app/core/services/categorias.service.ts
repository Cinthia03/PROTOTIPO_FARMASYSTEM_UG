import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service'; // Asegúrate de que la ruta sea correcta

export interface Categoria {
  id?: string;
  nombre: string;
  modulo: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  constructor(private supabaseService: SupabaseService) {}

  obtenerPorModulo(modulo: string) {
    return from(
      this.supabaseService.supabase
        .from('categorias')
        .select('*')
        .eq('modulo', modulo)
        .order('nombre', { ascending: true })
    );
  }
}