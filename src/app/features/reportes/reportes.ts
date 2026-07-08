import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DetalleItem {
  producto: string;
  categoria: string;
  cantidad: number;
  precio_unitario: number;
}

interface Factura {
  id: number;
  fecha: string;
  clientes: { nombre: string; identificacion: string } | null;
  metodo_pago: string;
  subtotal: number;
  iva: number;
  total: number;
  detalle: DetalleItem[];
}

interface Cliente {
  nombre: string;
  identificacion: string;
  telefono: string;
  correo: string;
  direccion: string;
  compras: number;
  totalGastado: number;
  ultimaCompra: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class Reportes {

  // ══════════════════════════════════
  // KPIs (datos quemados)
  // ══════════════════════════════════
  ventasHoyTotal = 45.43;
  ventasHoyCantidad = 3;
  productosStockBajo = 7;
  productosPorVencer = 4;
  valorInventarioTotal = 18540.75;

  // ══════════════════════════════════
  // Ventas por periodo (mock por filtro)
  // ══════════════════════════════════
  periodo: 'diario' | 'semanal' | 'mensual' = 'diario';

  private ventasDiario = [
    { periodo: '2026-07-06', num_ventas: 8,  total_ventas: 145.30 },
    { periodo: '2026-07-07', num_ventas: 11, total_ventas: 210.75 },
    { periodo: '2026-07-08', num_ventas: 9,  total_ventas: 178.40 },
    { periodo: '2026-07-09', num_ventas: 13, total_ventas: 256.90 },
    { periodo: '2026-07-10', num_ventas: 3,  total_ventas: 45.43 },
  ];

  private ventasSemanal = [
    { periodo: '2026-06-15', num_ventas: 52, total_ventas: 980.15 },
    { periodo: '2026-06-22', num_ventas: 61, total_ventas: 1120.60 },
    { periodo: '2026-06-29', num_ventas: 58, total_ventas: 1045.90 },
    { periodo: '2026-07-06', num_ventas: 44, total_ventas: 836.78 },
  ];

  private ventasMensual = [
    { periodo: '2026-04-01', num_ventas: 214, total_ventas: 4210.30 },
    { periodo: '2026-05-01', num_ventas: 238, total_ventas: 4675.85 },
    { periodo: '2026-06-01', num_ventas: 251, total_ventas: 4980.42 },
    { periodo: '2026-07-01', num_ventas: 44,  total_ventas: 836.78 },
  ];

  ventasPeriodoLista = this.ventasDiario;

  cambiarPeriodo(periodo: 'diario' | 'semanal' | 'mensual') {
    this.periodo = periodo;
    if (periodo === 'diario') this.ventasPeriodoLista = this.ventasDiario;
    if (periodo === 'semanal') this.ventasPeriodoLista = this.ventasSemanal;
    if (periodo === 'mensual') this.ventasPeriodoLista = this.ventasMensual;
  }

  // ══════════════════════════════════
  // Facturas (mock, con detalle de compra)
  // ══════════════════════════════════
  facturas: Factura[] = [
    {
      id: 1001,
      fecha: '2026-07-10T09:20:00',
      clientes: { nombre: 'Cinthia Tenesaca', identificacion: '0953806650' },
      metodo_pago: 'efectivo',
      subtotal: 10.00,
      iva: 1.50,
      total: 11.50,
      detalle: [
        { producto: 'Paracetamol 500mg', categoria: 'Medicamentos', cantidad: 2, precio_unitario: 1.25 },
        { producto: 'Alcohol Antiséptico 250ml', categoria: 'Insumos Médicos', cantidad: 1, precio_unitario: 2.10 },
        { producto: 'Jabón Antibacterial', categoria: 'Cuidado Personal', cantidad: 3, precio_unitario: 1.80 },
      ]
    },
    {
      id: 1002,
      fecha: '2026-07-10T11:45:00',
      clientes: { nombre: 'Juan Carlos Pérez', identificacion: '0923456781' },
      metodo_pago: 'tarjeta',
      subtotal: 19.00,
      iva: 2.85,
      total: 21.85,
      detalle: [
        { producto: 'Amoxicilina 500mg (14 cáps.)', categoria: 'Medicamentos', cantidad: 1, precio_unitario: 8.50 },
        { producto: 'Guantes de Nitrilo (caja)', categoria: 'Insumos Médicos', cantidad: 2, precio_unitario: 5.25 },
      ]
    },
    {
      id: 1003,
      fecha: '2026-07-09T16:10:00',
      clientes: { nombre: 'María Elena Espinoza', identificacion: '0918765432' },
      metodo_pago: 'efectivo',
      subtotal: 18.60,
      iva: 2.79,
      total: 21.39,
      detalle: [
        { producto: 'Loratadina 10mg', categoria: 'Medicamentos', cantidad: 1, precio_unitario: 3.20 },
        { producto: 'Suero Fisiológico 500ml', categoria: 'Insumos Médicos', cantidad: 2, precio_unitario: 2.75 },
        { producto: 'Protector Solar FPS 50', categoria: 'Cuidado Personal', cantidad: 1, precio_unitario: 9.90 },
      ]
    },
    {
      id: 1004,
      fecha: '2026-07-09T08:30:00',
      clientes: { nombre: 'Carlos Alfredo Mendoza', identificacion: '1723456789' },
      metodo_pago: 'transferencia',
      subtotal: 13.40,
      iva: 2.01,
      total: 15.41,
      detalle: [
        { producto: 'Losartán 50mg', categoria: 'Medicamentos', cantidad: 1, precio_unitario: 6.40 },
        { producto: 'Termómetro Digital', categoria: 'Insumos Médicos', cantidad: 1, precio_unitario: 7.00 },
      ]
    },
    {
      id: 1005,
      fecha: '2026-07-08T14:00:00',
      clientes: { nombre: 'Ana Lucía Torres', identificacion: '0104567892' },
      metodo_pago: 'tarjeta',
      subtotal: 13.85,
      iva: 2.08,
      total: 15.93,
      detalle: [
        { producto: 'Ibuprofeno 400mg', categoria: 'Medicamentos', cantidad: 2, precio_unitario: 2.10 },
        { producto: 'Vendas Elásticas', categoria: 'Insumos Médicos', cantidad: 3, precio_unitario: 1.35 },
        { producto: 'Shampoo Anticaspa', categoria: 'Cuidado Personal', cantidad: 1, precio_unitario: 5.60 },
      ]
    },
    {
      id: 1006,
      fecha: '2026-07-10T17:05:00',
      clientes: null,
      metodo_pago: 'efectivo',
      subtotal: 10.50,
      iva: 1.58,
      total: 12.08,
      detalle: [
        { producto: 'Vitamina C 1g efervescente', categoria: 'Medicamentos', cantidad: 1, precio_unitario: 4.50 },
        { producto: 'Mascarillas Quirúrgicas (caja)', categoria: 'Insumos Médicos', cantidad: 1, precio_unitario: 6.00 },
      ]
    },
  ];

  // ══════════════════════════════════
  // Rotación de productos (mock)
  // ══════════════════════════════════
  rotacionProductos = [
    { nombre: 'Paracetamol 500mg',        categoria: 'medicamentos', unidades_vendidas: 320, ingresos: 400.00 },
    { nombre: 'Amoxicilina 500mg',        categoria: 'medicamentos', unidades_vendidas: 145, ingresos: 1232.50 },
    { nombre: 'Guantes de Nitrilo',       categoria: 'insumos',      unidades_vendidas: 210, ingresos: 1102.50 },
    { nombre: 'Jabón Antibacterial',      categoria: 'cuidado',      unidades_vendidas: 180, ingresos: 324.00 },
    { nombre: 'Suero Fisiológico 500ml',  categoria: 'insumos',      unidades_vendidas: 96,  ingresos: 264.00 },
  ];

  // ══════════════════════════════════
  // Clientes (datos del INSERT proporcionado + métricas de compra)
  // ══════════════════════════════════
  clientes: Cliente[] = [
    {
      nombre: 'Cinthia Tenesaca',
      identificacion: '0953806650',
      telefono: '0995123456',
      correo: 'cinthia.tenesaca@gmail.com',
      direccion: 'Av. Juan Tanca Marengo, Guayaquil',
      compras: 1,
      totalGastado: 11.50,
      ultimaCompra: '2026-07-10',
    },
    {
      nombre: 'Juan Carlos Pérez',
      identificacion: '0923456781',
      telefono: '0984561230',
      correo: 'juan.perez@outmail.com',
      direccion: 'Urdesa Central, Calle 4ta, Guayaquil',
      compras: 1,
      totalGastado: 21.85,
      ultimaCompra: '2026-07-10',
    },
    {
      nombre: 'María Elena Espinoza',
      identificacion: '0918765432',
      telefono: '0991237894',
      correo: 'm.espinoza@farmaweb.com',
      direccion: 'Alborada 6ta Etapa, Guayaquil',
      compras: 1,
      totalGastado: 21.39,
      ultimaCompra: '2026-07-09',
    },
    {
      nombre: 'Carlos Alfredo Mendoza',
      identificacion: '1723456789',
      telefono: '0967891234',
      correo: 'carlos.mendoza@ecuanet.ec',
      direccion: 'Av. Amazonas y Patria, Quito',
      compras: 1,
      totalGastado: 15.41,
      ultimaCompra: '2026-07-09',
    },
    {
      nombre: 'Ana Lucía Torres',
      identificacion: '0104567892',
      telefono: '0971425368',
      correo: 'ana.torres@salud.org',
      direccion: 'Calle Larga y Benigno Malo, Cuenca',
      compras: 1,
      totalGastado: 15.93,
      ultimaCompra: '2026-07-08',
    },
  ];

  // ══════════════════════════════════
  // Abrir factura detallada en una pestaña nueva
  // ══════════════════════════════════
  imprimirFactura(id: number) {
    const factura = this.facturas.find(f => f.id === id);
    if (!factura) return;

    const ventana = window.open('', '_blank');
    if (!ventana) return;

    ventana.document.write(this.generarHTMLFactura(factura));
    ventana.document.close();
  }

  private generarHTMLFactura(f: Factura): string {
    const nombreCliente = f.clientes?.nombre ?? 'CONSUMIDOR FINAL';
    const idCliente = f.clientes?.identificacion ?? '9999999999999';
    const fecha = new Date(f.fecha);
    const fechaTexto = fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' });
    const horaTexto = fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

    const filas = f.detalle.map(d => `
      <tr>
        <td>
          <span class="nombre-item">${d.producto}</span>
          <span class="cat-item">${d.categoria}</span>
        </td>
        <td class="num">${d.cantidad}</td>
        <td class="num">$ ${d.precio_unitario.toFixed(2)}</td>
        <td class="num total-item">$ ${(d.cantidad * d.precio_unitario).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Factura #${f.id} · FarmaSystem</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Georgia&display=swap');

  :root{
    --primario:#133b4b;
    --acento:#1d6f5e;
    --papel:#fdfcf8;
    --texto:#20303a;
    --suave:#6b7c82;
    --borde:#dfe6e2;
    --alerta:#b91c1c;
  }

  *{box-sizing:border-box;}

  body{
    margin:0;
    padding:40px 16px 80px;
    min-height:100vh;
    font-family:'Segoe UI', system-ui, sans-serif;
    color:var(--texto);
    background-color:#0f2a35;
    background-image:
      radial-gradient(circle at 50% 0%, rgba(29,111,94,0.25), transparent 60%),
      repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 34px),
      repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 34px);
    display:flex;
    justify-content:center;
  }

  /* Marca de agua: cruces farmacéuticas repetidas, sutil */
  body::before{
    content:"";
    position:fixed;
    inset:0;
    pointer-events:none;
    opacity:0.05;
    background-image: url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>\
<path d='M34 20h12v14h14v12H46v14H34V46H20V34h14z' fill='white'/>\
</svg>");
    background-size:80px 80px;
  }

  .ticket{
    position:relative;
    width:100%;
    max-width:460px;
    background:var(--papel);
    border-radius:4px;
    box-shadow:0 30px 60px rgba(0,0,0,0.35);
    padding:32px 30px 26px;
  }

  /* Borde inferior tipo "papel rasgado" de rollo de recibo */
  .ticket::after{
    content:"";
    position:absolute;
    left:0; right:0; bottom:-11px;
    height:22px;
    background:
      linear-gradient(-45deg, var(--papel) 8px, transparent 0),
      linear-gradient(45deg, var(--papel) 8px, transparent 0);
    background-size:16px 22px;
    background-repeat:repeat-x;
  }

  .encabezado{
    text-align:center;
    border-bottom:1.5px dashed var(--borde);
    padding-bottom:16px;
    margin-bottom:16px;
  }

  .encabezado .cruz{
    width:40px;height:40px;
    margin:0 auto 8px;
    border-radius:10px;
    background:var(--primario);
    color:#fff;
    display:flex;align-items:center;justify-content:center;
    font-size:20px;
  }

  .encabezado h1{
    margin:0;
    font-family:Georgia, 'Times New Roman', serif;
    font-size:19px;
    font-weight:800;
    letter-spacing:0.6px;
    color:var(--primario);
    text-transform:uppercase;
  }

  .encabezado p{
    margin:4px 0 0;
    font-size:11px;
    color:var(--suave);
  }

  .meta{
    display:flex;
    justify-content:space-between;
    font-family:'Courier New', monospace;
    font-size:11.5px;
    color:var(--suave);
    margin-bottom:14px;
  }

  .meta strong{ color:var(--texto); }

  .bloque-cliente{
    background:#f3f7f5;
    border:1px solid var(--borde);
    border-radius:8px;
    padding:12px 14px;
    margin-bottom:18px;
    font-size:12px;
  }

  .bloque-cliente .fila{ display:flex; justify-content:space-between; padding:2px 0; }
  .bloque-cliente .etq{ color:var(--suave); }
  .bloque-cliente .val{ font-weight:600; text-align:right; }

  table{ width:100%; border-collapse:collapse; margin-bottom:14px; }

  thead th{
    text-align:left;
    font-size:10px;
    text-transform:uppercase;
    letter-spacing:0.5px;
    color:var(--suave);
    border-bottom:1.5px dashed var(--borde);
    padding-bottom:6px;
  }

  thead th.num, td.num{ text-align:right; }

  tbody td{
    padding:8px 0;
    border-bottom:1px dotted var(--borde);
    font-size:12px;
    vertical-align:top;
  }

  .nombre-item{ display:block; font-weight:600; }
  .cat-item{ display:block; font-size:10px; color:var(--suave); }
  .total-item{ font-weight:700; color:var(--acento); }

  .totales{
    border-top:1.5px dashed var(--borde);
    padding-top:10px;
    font-size:12.5px;
  }

  .totales .fila{ display:flex; justify-content:space-between; padding:3px 0; }
  .totales .gran-total{
    font-family:Georgia, serif;
    font-size:18px;
    font-weight:800;
    color:var(--primario);
    border-top:1px solid var(--borde);
    margin-top:6px;
    padding-top:8px;
  }

  .metodo-pago{
    display:inline-block;
    margin-top:10px;
    font-size:10.5px;
    text-transform:uppercase;
    letter-spacing:0.5px;
    background:var(--acento);
    color:#fff;
    padding:4px 10px;
    border-radius:99px;
  }

  .pie{
    text-align:center;
    margin-top:22px;
    font-size:10.5px;
    color:var(--suave);
    font-style:italic;
  }

  .acciones{
    max-width:460px;
    width:100%;
    display:flex;
    justify-content:center;
    margin-top:18px;
  }

  .acciones button{
    font-family:'Segoe UI', sans-serif;
    font-size:12.5px;
    font-weight:600;
    padding:9px 22px;
    border-radius:8px;
    border:1.5px solid rgba(255,255,255,0.35);
    background:rgba(255,255,255,0.08);
    color:#fff;
    cursor:pointer;
    backdrop-filter:blur(4px);
  }

  .acciones button:hover{ background:rgba(255,255,255,0.18); }

  @media print{
    body{ background:#fff; padding:0; }
    body::before{ display:none; }
    .acciones{ display:none; }
    .ticket{ box-shadow:none; max-width:100%; }
  }
</style>
</head>
<body>

  <div>
    <div class="ticket">
      <div class="encabezado">
        <div class="cruz">💊</div>
        <h1>FarmaSystem</h1>
        <p>Sistema de Gestión Farmacéutica</p>
      </div>

      <div class="meta">
        <span>Factura <strong>#${f.id}</strong></span>
        <span>${fechaTexto} · ${horaTexto}</span>
      </div>

      <div class="bloque-cliente">
        <div class="fila"><span class="etq">Cliente</span><span class="val">${nombreCliente}</span></div>
        <div class="fila"><span class="etq">Identificación</span><span class="val">${idCliente}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th class="num">Cant.</th>
            <th class="num">P. Unit.</th>
            <th class="num">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${filas}
        </tbody>
      </table>

      <div class="totales">
        <div class="fila"><span>Subtotal</span><span>$ ${f.subtotal.toFixed(2)}</span></div>
        <div class="fila"><span>IVA (15%)</span><span>$ ${f.iva.toFixed(2)}</span></div>
        <div class="fila gran-total"><span>Total</span><span>$ ${f.total.toFixed(2)}</span></div>
      </div>

      <div style="text-align:center;">
        <span class="metodo-pago">${f.metodo_pago}</span>
      </div>

      <p class="pie">Gracias por confiar en su salud a FarmaSystem</p>
    </div>
  </div>

  <div class="acciones">
    <button onclick="window.print()">🖨️ Imprimir</button>
  </div>

</body>
</html>
    `;
  }
}