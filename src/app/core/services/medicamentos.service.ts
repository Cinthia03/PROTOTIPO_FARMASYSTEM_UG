import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { environment } from '../../../environments/environment';
import { CategoriasService, Categoria } from './categorias.service';

export interface Medicamento {
  id?: string;
  codigo: string;
  nombre_comercial: string;
  nombre_generico: string;
  laboratorio?: string;
  categoria?: string;
  stock: number;
  unidad_medida: string;
  precio_compra: number;
  precio_venta: number;
  lote?: string;
  fecha_vencimiento: string;
  requiere_receta: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicamentosService {
  categorias: Categoria[] = [];

  constructor(
    private supabaseService: SupabaseService
  ) {}

  obtenerTodos() {

    return from(
      this.supabaseService.supabase
        .from('medicamentos')
        .select('*')
        .order('codigo')
    );

  }

  obtenerPorCodigo(codigo: string) {

    return from(
      this.supabaseService.supabase
        .from('medicamentos')
        .select('*')
        .eq('codigo', codigo)
        .single()
    );

  }

  generarCodigo() {

    return from(
      this.supabaseService.supabase
        .from('medicamentos')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1)
    );

  }

  crear(data: Medicamento) {

    return from(
      this.supabaseService.supabase
        .from('medicamentos')
        .insert(data)
    );

  }

  actualizar(codigo: string, data: Partial<Medicamento>) {

    return from(
      this.supabaseService.supabase
        .from('medicamentos')
        .update(data)
        .eq('codigo', codigo)
    );

  }

  eliminar(id: string) {

    return from(
      this.supabaseService.supabase
        .from('medicamentos')
        .delete()
        .eq('id', id)
    );

  }

}