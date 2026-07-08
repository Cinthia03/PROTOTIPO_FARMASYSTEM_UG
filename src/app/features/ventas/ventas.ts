import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  VentasService,
  Cliente,
  ProductoPOS,
  ItemCarrito,
  NuevaVenta
} from '../../core/services/ventas.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas {

  //-----------------------------------------------------
  // CLIENTE
  //-----------------------------------------------------

  cedulaInput = '';

  clienteSeleccionado: Cliente | null = null;

  //-----------------------------------------------------
  // PRODUCTOS
  //-----------------------------------------------------

  tablaSeleccionada:
    | 'medicamentos'
    | 'insumos_medicos'
    | 'cuidado_personal'
    = 'medicamentos';

  listaProductos: ProductoPOS[] = [];

  productoSeleccionadoId = '';

  //-----------------------------------------------------
  // CARRITO
  //-----------------------------------------------------

  carrito: ItemCarrito[] = [];

  metodoPago = 'efectivo';

  //-----------------------------------------------------

  IVA_TASA = 0.15;

  procesando = false;

  //-----------------------------------------------------

  constructor(
    private ventasService: VentasService
  ) {
    this.cargarProductosDeTablaActual();
  }

  //-----------------------------------------------------
  // BUSCAR CLIENTE
  //-----------------------------------------------------

  onCedulaChange(): void {

    const cedula = this.cedulaInput
      .replace(/\D/g, '')
      .trim();

    if (cedula.length !== 10) {
      this.clienteSeleccionado = null;
      return;
    }

    // El VentasService (basado en Supabase) devuelve { data, error } en
    // vez de emitir directamente el Cliente o un error HTTP 404.
    // `maybeSingle()` devuelve data=null cuando no encuentra al cliente,
    // así que ahí armamos el "CONSUMIDOR FINAL".
    this.ventasService.buscarClientePorCedula(cedula).subscribe({

      next: ({ data, error }) => {

        if (error) {
          console.error(error);
          alert('No fue posible consultar el cliente.');
          return;
        }

        if (data) {

          this.clienteSeleccionado = data;

        } else {

          this.clienteSeleccionado = {
            id: null,
            nombre: 'CONSUMIDOR FINAL',
            identificacion: '9999999999999',
            correo: '',
            direccion: '',
            telefono: ''
          };

        }

      },

      error: (err) => {

        console.error(err);
        alert('No fue posible consultar el cliente.');

      }

    });

  }

  //-----------------------------------------------------
  // CAMBIAR CATEGORÍA
  //-----------------------------------------------------

  cambiarCategoria(): void {

    this.productoSeleccionadoId = '';

    this.listaProductos = [];

    this.cargarProductosDeTablaActual();

  }

  //-----------------------------------------------------
  // CARGAR PRODUCTOS
  //-----------------------------------------------------

  cargarProductosDeTablaActual(): void {

    // El servicio devuelve { data, error } en vez de emitir el array
    // directamente o un error HTTP.
    this.ventasService
      .listarProductos(this.tablaSeleccionada)
      .subscribe({

        next: ({ data, error }) => {

          if (error) {
            console.error(error);
            this.listaProductos = [];
            return;
          }

          this.listaProductos = data || [];

        },

        error: (err) => {

          console.error(err);

          this.listaProductos = [];

        }

      });

  }

  //-----------------------------------------------------
  // PRODUCTO SELECCIONADO
  //-----------------------------------------------------

  get productoSeleccionado(): ProductoPOS | undefined {

    return this.listaProductos.find(

      p => p.id === this.productoSeleccionadoId

    );

  }
    //-----------------------------------------------------
  // AGREGAR PRODUCTO
  //-----------------------------------------------------

  agregarProductoSeleccionado(): void {

    if (!this.productoSeleccionadoId) {
      alert('Seleccione un producto.');
      return;
    }

    const producto = this.listaProductos.find(
      p => p.id === this.productoSeleccionadoId
    );

    if (!producto) {
      alert('Producto no encontrado.');
      return;
    }

    if (producto.stock <= 0) {
      alert('El producto no tiene stock.');
      return;
    }

    const existente = this.carrito.find(
      item =>
        item.producto_id === producto.id &&
        item.tabla_producto === this.tablaSeleccionada
    );

    if (existente) {

      if (existente.cantidad + 1 > producto.stock) {

        alert(`Solo existen ${producto.stock} unidades disponibles.`);

        return;

      }

      existente.cantidad++;

      // Mantenemos el stock disponible sincronizado con el producto real
      existente.stock_disponible = producto.stock;

      existente.subtotal = Number(
        (
          existente.cantidad *
          existente.precio_unitario
        ).toFixed(2)
      );

    } else {

      this.carrito.push({

        producto_id: producto.id,

        tabla_producto: this.tablaSeleccionada,

        nombre: producto.nombre,

        cantidad: 1,

        precio_unitario: Number(producto.precio_venta),

        subtotal: Number(producto.precio_venta),

        // Se guarda el stock disponible EN el ítem del carrito para no
        // depender de listaProductos, que cambia según la categoría
        // seleccionada en el combo.
        stock_disponible: producto.stock

      });

    }

    this.productoSeleccionadoId = '';

  }

  //-----------------------------------------------------
  // ACTUALIZAR CANTIDAD
  //-----------------------------------------------------

  actualizarCantidad(item: ItemCarrito): void {

    if (item.cantidad < 1) {
      item.cantidad = 1;
    }

    if (item.cantidad > item.stock_disponible) {

      alert(`Solo existen ${item.stock_disponible} unidades disponibles.`);

      item.cantidad = item.stock_disponible;

    }

    item.subtotal = Number(
      (
        item.cantidad *
        item.precio_unitario
      ).toFixed(2)
    );

  }

  //-----------------------------------------------------
  // ELIMINAR DEL CARRITO
  //-----------------------------------------------------

  eliminarDelCarrito(index: number): void {

    this.carrito.splice(index, 1);

  }

  //-----------------------------------------------------
  // LIMPIAR CARRITO
  //-----------------------------------------------------

  limpiarCarrito(): void {

    this.carrito = [];

  }

  //-----------------------------------------------------
  // SUBTOTAL
  //-----------------------------------------------------

  get subtotal(): number {

    return Number(

      this.carrito
        .reduce(
          (total, item) => total + item.subtotal,
          0
        )
        .toFixed(2)

    );

  }

  //-----------------------------------------------------
  // IVA
  //-----------------------------------------------------

  get iva(): number {

    return Number(

      (
        this.subtotal *
        this.IVA_TASA
      ).toFixed(2)

    );

  }

  //-----------------------------------------------------
  // TOTAL
  //-----------------------------------------------------

  get total(): number {

    return Number(

      (
        this.subtotal +
        this.iva
      ).toFixed(2)

    );

  }
    //-----------------------------------------------------
  // LIMPIAR FORMULARIO
  //-----------------------------------------------------

  limpiarFormulario(): void {

    this.cedulaInput = '';

    this.clienteSeleccionado = null;

    this.productoSeleccionadoId = '';

    this.carrito = [];

    this.metodoPago = 'efectivo';

  }

  //-----------------------------------------------------
  // FINALIZAR VENTA
  //-----------------------------------------------------

  finalizarVenta(): void {

    if (this.procesando) {
      return;
    }

    if (this.carrito.length === 0) {

      alert('Debe agregar al menos un producto.');

      return;

    }


    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      alert('Debe iniciar sesión nuevamente.');
      return;
    }

    let usuarioId: number;

    try {
      const usuarioObj = JSON.parse(usuarioGuardado);
      usuarioId = Number(usuarioObj.id);
      
      if (isNaN(usuarioId)) {
        throw new Error("El ID de usuario no es un número válido.");
      }
    } catch (e) {
      console.error("Error al obtener el ID de usuario desde localStorage", e);
      alert('Error de sesión. Por favor, cierre sesión e ingrese nuevamente.');
      return;
    }

    // Ahora venta.usuario_id llevará el número correcto (ej: 1, 2, etc.)
    const venta: NuevaVenta = {
      cliente_id: this.clienteSeleccionado && this.clienteSeleccionado.nombre !== 'CONSUMIDOR FINAL'
        ? this.clienteSeleccionado.id
        : null,
      usuario_id: usuarioId, // ✨ Enviará el bigint correcto
      metodo_pago: this.metodoPago,
      subtotal: this.subtotal,
      iva: this.iva,
      total: this.total,
      items: this.carrito.map(item => ({
        producto_id: item.producto_id,
        tabla_producto: item.tabla_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      }))
    };
    this.procesando = true;
    this.ventasService.crearVenta(venta).subscribe({
      next: (respuesta) => {
        alert('Venta registrada correctamente.');
        this.imprimirFactura(respuesta.id);
        this.limpiarFormulario();
        this.cargarProductosDeTablaActual();
        this.procesando = false;
      },
      error: (err) => {
        console.error(err);
        alert(
          err?.message ||
          'No fue posible registrar la venta.'

        );

        this.procesando = false;

      }

    });

  }
    //-----------------------------------------------------
  // IMPRIMIR FACTURA
  //-----------------------------------------------------

  imprimirFactura(idVenta: string): void {

    let html = `
    <html>
    <head>

      <title>Factura</title>

      <style>

        body{
          font-family: Arial;
          padding:30px;
        }

        h2{
          text-align:center;
        }

        table{
          width:100%;
          border-collapse:collapse;
          margin-top:20px;
        }

        th,td{
          border:1px solid #000;
          padding:6px;
          text-align:left;
        }

        .totales{
          margin-top:20px;
        }

      </style>

    </head>

    <body>

      <h2>FARMACIA</h2>

      <hr>

      <b>Factura Nº:</b> ${idVenta}<br>

      <b>Fecha:</b> ${new Date().toLocaleString()}<br>

      <b>Cliente:</b>
      ${this.clienteSeleccionado?.nombre || 'CONSUMIDOR FINAL'}
      <br>

      <b>Identificación:</b>
      ${this.clienteSeleccionado?.identificacion || '9999999999999'}
      <br>

      <b>Método de pago:</b>
      ${this.metodoPago}
      <br><br>

      <table>

        <thead>

          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>P.Unit.</th>
            <th>Total</th>
          </tr>

        </thead>

        <tbody>
    `;

    this.carrito.forEach(item => {

      html += `
        <tr>
          <td>${item.nombre}</td>
          <td>${item.cantidad}</td>
          <td>$ ${item.precio_unitario.toFixed(2)}</td>
          <td>$ ${item.subtotal.toFixed(2)}</td>
        </tr>
      `;

    });

    html += `

        </tbody>

      </table>

      <table class="totales">

        <tr>
          <td>Subtotal</td>
          <td>$ ${this.subtotal.toFixed(2)}</td>
        </tr>

        <tr>
          <td>IVA</td>
          <td>$ ${this.iva.toFixed(2)}</td>
        </tr>

        <tr>
          <td><b>TOTAL</b></td>
          <td><b>$ ${this.total.toFixed(2)}</b></td>
        </tr>

      </table>

      <script>

        window.print();

        window.onafterprint = function () {
          window.close();
        };

      </script>

    </body>

    </html>
    `;

    const ventana = window.open('', '_blank');

    if (ventana) {

      ventana.document.open();

      ventana.document.write(html);

      ventana.document.close();

    }

  }

}