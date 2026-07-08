import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-categorias-inventario',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit {

  // DÍAS PARA CONSIDERAR "PRÓXIMO A VENCER"
  private readonly DIAS_ALERTA_VENCIMIENTO = 30;

  // TOTALES
  totalMedicamentos = 0;
  totalInsumos = 0;
  totalCuidado = 0;
  totalRegistros = 0;

  // KPIS
  porcentajeOptimo = 0;
  itemsStockBajo = 0;
  itemsPorVencer = 0;

  // MEDICAMENTOS
  stockMedicamentos = 0;
  valorTotalMedicamentos = 0;
  stockBajoMedicamentos = 0;

  // INSUMOS MÉDICOS
  stockInsumos = 0;
  valorTotalInsumos = 0;
  stockBajoInsumos = 0;

  // CUIDADO PERSONAL
  stockCuidado = 0;
  valorTotalCuidado = 0;
  stockBajoCuidado = 0;

  // PAGINAS
  paginaActualAct = 1;
  itemsPorPaginaAct = 5;

  paginaActualAle = 1;
  itemsPorPaginaAle = 5;

  // OTROS
  cargando = true;
  fechaActual = new Date();
  actividadReciente: any[] = [];
  alertasStock: any[] = [];

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  async cargarDashboard(): Promise<void> {

    this.cargando = true;

    try {

      const { data: medicamentos } =
        await this.supabaseService.supabase
          .from('medicamentos')
          .select('*');

      const { data: insumos } =
        await this.supabaseService.supabase
          .from('insumos_medicos')
          .select('*');

      const { data: cuidado } =
        await this.supabaseService.supabase
          .from('cuidado_personal')
          .select('*');

      const listaMedicamentos = medicamentos ?? [];
      const listaInsumos = insumos ?? [];
      const listaCuidado = cuidado ?? [];

      // ======================
      // TOTALES
      // ======================

      this.totalMedicamentos = listaMedicamentos.length;
      this.totalInsumos = listaInsumos.length;
      this.totalCuidado = listaCuidado.length;

      this.totalRegistros =
        this.totalMedicamentos +
        this.totalInsumos +
        this.totalCuidado;

      // ======================
      // STOCK BAJO (por umbral propio de cada producto)
      // ======================

      const esStockBajo = (item: any) =>
        Number(item.stock || 0) < Number(item.stock_minimo ?? 10);

      this.stockBajoMedicamentos = listaMedicamentos.filter(esStockBajo).length;
      this.stockBajoInsumos = listaInsumos.filter(esStockBajo).length;
      this.stockBajoCuidado = listaCuidado.filter(esStockBajo).length;

      this.itemsStockBajo =
        this.stockBajoMedicamentos +
        this.stockBajoInsumos +
        this.stockBajoCuidado;

      // ======================
      // % DE DISPONIBILIDAD POR CATEGORÍA
      // (porcentaje de ítems que SÍ están en nivel óptimo)
      // ======================

      this.stockMedicamentos = this.calcularPorcentajeOptimo(listaMedicamentos, esStockBajo);
      this.stockInsumos = this.calcularPorcentajeOptimo(listaInsumos, esStockBajo);
      this.stockCuidado = this.calcularPorcentajeOptimo(listaCuidado, esStockBajo);

      this.porcentajeOptimo =
        this.totalRegistros > 0
          ? Math.round(
              ((this.totalRegistros - this.itemsStockBajo) / this.totalRegistros) * 100
            )
          : 0;

      // ======================
      // VALOR TOTAL POR CATEGORÍA
      // ======================

      this.valorTotalMedicamentos = this.calcularValorTotal(listaMedicamentos);
      this.valorTotalInsumos = this.calcularValorTotal(listaInsumos);
      this.valorTotalCuidado = this.calcularValorTotal(listaCuidado);

      // ======================
      // PRÓXIMOS A VENCER (≤ 30 días, incluye ya vencidos)
      // ======================

      const hoy = new Date();
      const limite = new Date();
      limite.setDate(hoy.getDate() + this.DIAS_ALERTA_VENCIMIENTO);

      const proximosAVencer = (item: any) => {
        if (!item.fecha_vencimiento) return false;
        const fecha = new Date(item.fecha_vencimiento);
        return fecha <= limite;
      };

      const vencimientosMedicamentos = listaMedicamentos.filter(proximosAVencer);
      const vencimientosInsumos = listaInsumos.filter(proximosAVencer);
      const vencimientosCuidado = listaCuidado.filter(proximosAVencer);

      this.itemsPorVencer =
        vencimientosMedicamentos.length +
        vencimientosInsumos.length +
        vencimientosCuidado.length;

      // ======================
      // ACTIVIDAD RECIENTE (últimos ingresos por categoría)
      // ======================

      this.actividadReciente = [
        ...listaMedicamentos.slice(0, 5).map(m => ({
          modulo: 'medicamentos',
          moduloLabel: 'Medicamentos',
          nombre: m.nombre_comercial ?? m.codigo,
          accion: 'Ingreso registrado',
          tiempo: this.formatearFecha(m.fecha_ingreso)
        })),
        ...listaInsumos.slice(0, 5).map(i => ({
          modulo: 'insumos',
          moduloLabel: 'Insumos Médicos',
          nombre: i.nombre ?? i.codigo,
          accion: 'Ingreso registrado',
          tiempo: this.formatearFecha(i.fecha_ingreso)
        })),
        ...listaCuidado.slice(0, 5).map(c => ({
          modulo: 'cuidado',
          moduloLabel: 'Cuidado Personal',
          nombre: c.nombre ?? c.codigo,
          accion: 'Ingreso registrado',
          tiempo: this.formatearFecha(c.fecha_ingreso)
        }))
      ];

      // ======================
      // ALERTAS: STOCK BAJO + VENCIMIENTOS
      // ======================

      const alertasBajo = [
        ...listaMedicamentos.filter(esStockBajo).map(m => this.mapAlertaStock(m, 'Medicamentos', 'nombre_comercial')),
        ...listaInsumos.filter(esStockBajo).map(i => this.mapAlertaStock(i, 'Insumos Médicos', 'nombre')),
        ...listaCuidado.filter(esStockBajo).map(c => this.mapAlertaStock(c, 'Cuidado Personal', 'nombre'))
      ];

      const alertasVencimiento = [
        ...vencimientosMedicamentos.map(m => this.mapAlertaVencimiento(m, 'Medicamentos', 'nombre_comercial')),
        ...vencimientosInsumos.map(i => this.mapAlertaVencimiento(i, 'Insumos Médicos', 'nombre')),
        ...vencimientosCuidado.map(c => this.mapAlertaVencimiento(c, 'Cuidado Personal', 'nombre'))
      ];

      this.alertasStock = [...alertasVencimiento, ...alertasBajo];

    } catch (err) {

      console.error(
        'Error cargando dashboard:',
        err
      );

    } finally {

      this.cargando = false;
      this.cd.detectChanges();

    }
  }

  private calcularValorTotal(lista: any[]): number {
    return lista.reduce(
      (sum, item) => sum + (Number(item.stock || 0) * Number(item.precio_venta || 0)),
      0
    );
  }

  private calcularPorcentajeOptimo(lista: any[], esStockBajo: (item: any) => boolean): number {
    if (lista.length === 0) return 0;
    const enBajo = lista.filter(esStockBajo).length;
    return Math.round(((lista.length - enBajo) / lista.length) * 100);
  }

  private mapAlertaStock(item: any, modulo: string, campoNombre: string) {
    const stock = Number(item.stock || 0);
    const minimo = Number(item.stock_minimo ?? 10);
    return {
      tipo: 'stock',
      nombre: item[campoNombre] ?? item.codigo,
      modulo,
      detalle: stock,
      icono: 'inventory_2',
      nivel: stock === 0 ? 'critico' : 'bajo'
    };
  }

  private mapAlertaVencimiento(item: any, modulo: string, campoNombre: string) {
    return {
      tipo: 'vencimiento',
      nombre: item[campoNombre] ?? item.codigo,
      modulo,
      detalle: this.formatearFecha(item.fecha_vencimiento),
      icono: 'event_busy',
      nivel: 'vencimiento'
    };
  }

  private formatearFecha(fecha: string | Date | undefined): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ======================
  // PAGINACION ACTIVIDAD
  // ======================

  totalPaginasAct(): number {
    return Math.ceil(
      this.actividadReciente.length /
      this.itemsPorPaginaAct
    ) || 1;
  }

  obtenerActividadPaginada(): any[] {

    const inicio =
      (this.paginaActualAct - 1) *
      this.itemsPorPaginaAct;

    const fin =
      inicio +
      this.itemsPorPaginaAct;

    return this.actividadReciente.slice(
      inicio,
      fin
    );
  }

  // ======================
  // PAGINACION ALERTAS
  // ======================

  totalPaginasAle(): number {
    return Math.ceil(
      this.alertasStock.length /
      this.itemsPorPaginaAle
    ) || 1;
  }

  obtenerAlertasPaginated(): any[] {

    const inicio =
      (this.paginaActualAle - 1) *
      this.itemsPorPaginaAle;

    const fin =
      inicio +
      this.itemsPorPaginaAle;

    return this.alertasStock.slice(
      inicio,
      fin
    );
  }

  // ======================
  // NAVEGACION
  // ======================

  abrirMedicamentos() {
    this.router.navigate(['/medicamentos'])
      .catch(err =>
        console.error('Error navegación:', err)
      );
  }

  abrirInsumos() {
    this.router.navigate(['/insumos'])
      .catch(err =>
        console.error('Error navegación:', err)
      );
  }

  abrirCuidadoPersonal() {
    this.router.navigate(['/cuidado-personal'])
      .catch(err =>
        console.error('Error navegación:', err)
      );
  }
}