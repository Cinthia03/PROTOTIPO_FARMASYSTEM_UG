import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface Insumo {
  id?: string;
  codigo: string;
  nombre: string;
  categoria: string;
  marca?: string;
  unidad_medida: string;
  stock: number;
  stock_minimo?: number;
  precio_compra: number;
  precio_venta: number;
  lote?: string;
  fecha_vencimiento?: string;
  proveedor_id?: string;
  fecha_ingreso?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InsumosService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  obtenerTodos(): Observable<{ data: Insumo[] | null; error: any }> {
    return from(
      this.supabaseService.supabase
        .from('insumos_medicos')
        .select('*')
        .order('codigo', { ascending: true })
    );
  }

  generarCodigo(): Observable<{ data: { codigo: string }[] | null; error: any }> {
    return from(
      this.supabaseService.supabase
        .from('insumos_medicos')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1)
    );
  }

  crear(insumo: Insumo): Observable<any> {
    return from(
      this.supabaseService.supabase
        .from('insumos_medicos')
        .insert([insumo])
    );
  }

  actualizar(codigo: string, insumo: Partial<Insumo>): Observable<any> {
    return from(
      this.supabaseService.supabase
        .from('insumos_medicos')
        .update(insumo)
        .eq('codigo', codigo)
    );
  }

  eliminar(id: string): Observable<any> {
    return from(
      this.supabaseService.supabase
        .from('insumos_medicos')
        .delete()
        .eq('id', id)
    );
  }
}