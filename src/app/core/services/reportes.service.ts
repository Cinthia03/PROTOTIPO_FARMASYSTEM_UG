import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(private supabaseService: SupabaseService) {}

  // 1. Obtener todas las ventas con sus clientes vinculados
  obtenerHistorialDirecto(): Observable<{ data: any[] | null; error: any }> {
    return from(
      this.supabaseService.supabase
        .from('ventas')
        .select(`
          id,
          fecha,
          metodo_pago,
          total,
          estado,
          clientes (
            nombre,
            identificacion
          )
        `)
        .order('fecha', { ascending: false })
    );
  }

  // 2. Obtener stocks limpios (evita el error de sintaxis URL anterior)
  obtenerStocksProductos(tabla: 'medicamentos' | 'insumos_medicos' | 'cuidado_personal'): Observable<{ data: any[] | null; error: any }> {
    return from(
      this.supabaseService.supabase
        .from(tabla)
        .select('id, nombre, stock, precio')
    );
  }

  // 3. Obtener fechas de vencimiento desde detalle_compra
  obtenerProductosPorVencer(): Observable<{ data: any[] | null; error: any }> {
    return from(
      this.supabaseService.supabase
        .from('detalle_compra')
        .select('producto_id, fecha_vencimiento')
    );
  }

  // 4. Obtener todos los detalles de ventas para calcular la rotación
  obtenerDetallesVentas(): Observable<{ data: any[] | null; error: any }> {
    return from(
      this.supabaseService.supabase
        .from('detalle_venta')
        .select('tabla_producto, producto_id, cantidad, subtotal')
    );
  }
}