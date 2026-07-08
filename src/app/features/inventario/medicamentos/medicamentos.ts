import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';
import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';
import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';
import {
  MedicamentosService,
  Medicamento
} from '../../../core/services/medicamentos.service';
import {
  CategoriasService,
  Categoria
} from '../../../core/services/categorias.service';

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule
  ],
  templateUrl: './medicamentos.html',
  styleUrls: ['../inventario.css']
})
export class Medicamentos implements AfterViewInit {

  form!: FormGroup;
  categorias: Categoria[] = [];

  displayedColumns = [
    'codigo',
    'nombre_comercial',
    'nombre_generico',
    'laboratorio',
    'categoria',
    'stock',
    'unidad_medida',
    'precio_compra',
    'precio_venta',
    'lote',
    'fecha_vencimiento',
    'requiere_receta',
    'fecha_ingreso',
    'activo',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Medicamento>();
  medicamentos: Medicamento[] = [];
  filtroTexto = '';
  modoEdicion = false;
  codigoEditar: string | null = null;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private service: MedicamentosService,
    private categoriasService: CategoriasService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {

    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre_comercial: ['', Validators.required],
      nombre_generico: ['', Validators.required],
      laboratorio: [''],
      categoria: ['', Validators.required],
      unidad_medida: ['unidad', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      precio_compra: [0, [Validators.required, Validators.min(0)]],
      precio_venta: [0, [Validators.required, Validators.min(0)]],
      lote: [''],
      fecha_vencimiento: [''],
      requiere_receta: [false]
    });

  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cargarDatos();
    this.generarCodigo();
    this.cargarCategorias();
  }

  cargarDatos() {
    this.service.obtenerTodos().subscribe({
      next: (resp: any) => {
        this.medicamentos = resp.data ?? [];
        this.dataSource.data = this.medicamentos;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  cargarCategorias() {
    this.categoriasService.obtenerPorModulo('medicamentos').subscribe({
      next: (resp: any) => {
        // El SDK de Supabase devuelve un objeto con la estructura: { data: [...], error: ... }
        console.log('Respuesta directa de Supabase:', resp);

        if (resp && resp.data) {
          this.categorias = resp.data;
        } else if (Array.isArray(resp)) {
          this.categorias = resp;
        }

        console.log('Categorías asignadas al combo box:', this.categorias);
      },
      error: (err: any) => console.error('Error al cargar categorías:', err)
    });
  }

  aplicarFiltro(event: Event) {
    const valor = (event.target as HTMLInputElement)
      .value
      .trim()
      .toLowerCase();
    this.dataSource.filter = valor;
  }

  generarCodigo() {
    this.service.generarCodigo().subscribe({
      next: (resp: any) => {
        const { data, error } = resp;
        if (error) {
          console.error(error);
          return;
        }
        let codigo = 'MED-0001';
        if (data && data.length > 0) {
          const ultimo = data[0].codigo;
          const numero = parseInt(
            ultimo.replace('MED-', '')
          ) + 1;

          codigo =
            'MED-' +
            numero.toString().padStart(4, '0');
        }

        this.form.patchValue({
          codigo
        });
      },
      error: (err: any) => console.error(err)
    });
  }

  guardar() {
    const medicamento = this.form.value;
    if (this.modoEdicion) {
      this.service
        .actualizar(this.codigoEditar!, medicamento)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Medicamento actualizado',
              'Cerrar',
              { duration: 3000 }
            );
            this.reiniciar();
          },
          error: (err: any) => console.error(err)
        });
    } else {
      this.service
        .crear(medicamento)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Medicamento registrado',
              'Cerrar',
              { duration: 3000 }
            );
            this.reiniciar();
          },
          error: (err: any) => console.error(err)
        });
    }
  }

  editar(item: Medicamento) {
    this.modoEdicion = true;
    this.codigoEditar = item.codigo;
    this.form.patchValue(item);
  }

  eliminar(id: string) {
    if (!confirm('¿Desea eliminar este medicamento?')) {
      return;
    }

    this.service.eliminar(id).subscribe({
      next: () => {
        this.snackBar.open(
          'Registro eliminado',
          'Cerrar',
          { duration: 3000 }
        );
        this.cargarDatos();
      },
      error: (err: any) => console.error(err)
    });

  }

  nuevoRegistro() {
    this.reiniciar();
  }

  private reiniciar() {
    this.form.reset({
      unidad_medida: 'unidad',
      stock: 0,
      precio_compra: 0,
      precio_venta: 0,
      requiere_receta: false
    });
    this.modoEdicion = false;
    this.codigoEditar = null;
    this.generarCodigo();
    this.cargarDatos();
  }

}