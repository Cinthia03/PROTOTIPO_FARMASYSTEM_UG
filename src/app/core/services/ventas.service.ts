import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface Cliente {
  id: string | null;
  nombre: string;
  identificacion: string;
  correo?: string;
  direccion?: string;
  telefono?: string;
}

export interface ProductoPOS {
  id: string;
  nombre: string;
  precio_venta: number;
  stock: number;
}

export interface ItemCarrito {
  producto_id: string;
  tabla_producto: 'medicamentos' | 'insumos_medicos' | 'cuidado_personal';
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  // Se usa en ventas.ts para validar el máximo por ítem sin depender
  // de listaProductos (que cambia según la categoría del combo).
  stock_disponible: number;
}

export interface NuevaVenta {
  cliente_id: string | null;
  usuario_id: number;
  metodo_pago: string;
  subtotal: number;
  iva: number;
  total: number;
  items: {
    producto_id: string;
    tabla_producto: 'medicamentos' | 'insumos_medicos' | 'cuidado_personal';
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
}

const TABLAS_PRODUCTO: Record<
  'medicamentos' | 'insumos_medicos' | 'cuidado_personal',
  string
> = {
  medicamentos: 'medicamentos',
  insumos_medicos: 'insumos_medicos',
  cuidado_personal: 'cuidado_personal'
};

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  // ==========================================================
  // CLIENTES
  // ==========================================================

  buscarClientePorCedula(
    cedula: string
  ): Observable<{ data: Cliente | null; error: any }> {

    return from(
      this.supabaseService.supabase
        .from('clientes')
        .select('id, nombre, identificacion, correo, direccion, telefono')
        .eq('identificacion', cedula)
        .maybeSingle()
    );

  }

  crearCliente(
    cliente: Partial<Cliente>
  ): Observable<{ data: Cliente | null; error: any }> {

    return from(
      this.supabaseService.supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single()
    );

  }

  // ==========================================================
  // PRODUCTOS
  // ==========================================================

  listarProductos(
    tabla: 'medicamentos' | 'insumos_medicos' | 'cuidado_personal'
  ): Observable<{ data: ProductoPOS[] | null; error: any }> {

    // FarmaSystem tiene columnas distintas para el nombre según la
    // tabla (medicamentos usa nombre_comercial; el resto usa nombre).
    const columnaNombre = tabla === 'medicamentos' ? 'nombre_comercial' : 'nombre';

    return from(
      this.supabaseService.supabase
        .from(TABLAS_PRODUCTO[tabla])
        .select(`id, ${columnaNombre}, precio_venta, stock`)
        .eq('activo', true)
        .order(columnaNombre, { ascending: true })
    ).pipe(
      map(({ data, error }) => ({
        data: data
          ? (data as any[]).map(row => ({
              id: row.id,
              nombre: tabla === 'medicamentos' ? row.nombre_comercial : row.nombre,
              precio_venta: Number(row.precio_venta),
              stock: Number(row.stock)
            }))
          : null,
        error
      }))
    );

  }

  // ==========================================================
  // VENTAS
  // ==========================================================

  /**
   * IMPORTANTE: a diferencia del backend Express (que usaba BEGIN/COMMIT
   * y SELECT ... FOR UPDATE para bloquear filas), Supabase-js desde el
   * navegador no puede abrir una transacción real ni bloquear filas.
   * Esta implementación verifica y descuenta el stock paso a paso, pero
   * existe una ventana de condición de carrera entre el SELECT y el
   * UPDATE si dos ventas del mismo producto ocurren casi simultáneamente.
   * Para eliminar ese riesgo por completo, lo ideal sería mover esta
   * lógica a una función RPC de Postgres (transacción en el servidor).
   */
  crearVenta(
    venta: NuevaVenta
  ): Observable<{ id: string; ok: true }> {

    return from(this.procesarVenta(venta));

  }

  private async procesarVenta(
    venta: NuevaVenta
  ): Promise<{ id: string; ok: true }> {

    const supabase = this.supabaseService.supabase;

    // 1. Verificar y descontar stock de cada ítem
    for (const item of venta.items) {

      const tabla = TABLAS_PRODUCTO[item.tabla_producto];

      const { data: producto, error: errorProducto } = await supabase
        .from(tabla)
        .select('id, stock')
        .eq('id', item.producto_id)
        .single();

      if (errorProducto || !producto) {
        throw new Error(`Producto no encontrado: ${item.producto_id}`);
      }

      if (Number(producto.stock) < item.cantidad) {
        throw new Error(`Stock insuficiente para ${item.producto_id}`);
      }

      const { error: errorUpdate } = await supabase
        .from(tabla)
        .update({ stock: Number(producto.stock) - item.cantidad })
        .eq('id', item.producto_id);

      if (errorUpdate) {
        throw new Error(errorUpdate.message);
      }

    }

    // 2. Crear cabecera de venta
    const { data: ventaCreada, error: errorVenta } = await supabase
      .from('ventas')
      .insert([{
        cliente_id: venta.cliente_id,
        usuario_id: venta.usuario_id,
        subtotal: venta.subtotal,
        iva: venta.iva,
        total: venta.total,
        metodo_pago: venta.metodo_pago,
        estado: 'completada',
        fecha: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (errorVenta || !ventaCreada) {
      throw new Error(errorVenta?.message || 'No fue posible registrar la venta.');
    }

    // 3. Insertar detalle de venta
    const detalle = venta.items.map(item => ({
      venta_id: ventaCreada.id,
      tabla_producto: item.tabla_producto,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal
    }));

    const { error: errorDetalle } = await supabase
      .from('detalle_venta')
      .insert(detalle);

    if (errorDetalle) {
      throw new Error(errorDetalle.message);
    }

    return { id: ventaCreada.id, ok: true };

  }

  anularVenta(
    idVenta: string,
    motivo: string
  ): Observable<{ ok: true }> {

    return from(this.procesarAnulacion(idVenta, motivo));

  }

  private async procesarAnulacion(
    idVenta: string,
    motivo: string
  ): Promise<{ ok: true }> {

    const supabase = this.supabaseService.supabase;

    const { data: detalle, error: errorDetalle } = await supabase
      .from('detalle_venta')
      .select('tabla_producto, producto_id, cantidad')
      .eq('venta_id', idVenta);

    if (errorDetalle) {
      throw new Error(errorDetalle.message);
    }

    for (const item of (detalle || []) as any[]) {

      const tabla = TABLAS_PRODUCTO[item.tabla_producto as keyof typeof TABLAS_PRODUCTO];

      if (!tabla) {
        continue;
      }

      const { data: producto } = await supabase
        .from(tabla)
        .select('stock')
        .eq('id', item.producto_id)
        .single();

      if (producto) {
        await supabase
          .from(tabla)
          .update({ stock: Number(producto.stock) + item.cantidad })
          .eq('id', item.producto_id);
      }

    }

    const { error: errorUpdate } = await supabase
      .from('ventas')
      .update({ estado: 'anulada', motivo_anulacion: motivo })
      .eq('id', idVenta);

    if (errorUpdate) {
      throw new Error(errorUpdate.message);
    }

    return { ok: true };

  }

}