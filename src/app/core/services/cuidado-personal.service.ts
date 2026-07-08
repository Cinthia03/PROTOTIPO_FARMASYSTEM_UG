import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface CuidadoItem {
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
  proveedor_id?: string;
  fecha_ingreso?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CuidadoPersonalService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  obtenerTodos(): Observable<{ data: CuidadoItem[] | null; error: any }> {
    return from(
      this.supabaseService.supabase
        .from('cuidado_personal')
        .select('*')
        .order('codigo', { ascending: true })
    );
  }

  generarCodigo(): Observable<{ data: { codigo: string }[] | null; error: any }> {
    return from(
      this.supabaseService.supabase
        .from('cuidado_personal')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1)
    );
  }

  crear(item: CuidadoItem): Observable<any> {
    return from(
      this.supabaseService.supabase
        .from('cuidado_personal')
        .insert([item])
    );
  }

  actualizar(codigo: string, item: Partial<CuidadoItem>): Observable<any> {
    return from(
      this.supabaseService.supabase
        .from('cuidado_personal')
        .update(item)
        .eq('codigo', codigo)
    );
  }

  eliminar(id: string): Observable<any> {
    return from(
      this.supabaseService.supabase
        .from('cuidado_personal')
        .delete()
        .eq('id', id)
    );
  }
}