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
  CuidadoPersonalService,
  CuidadoItem
} from '../../../core/services/cuidado-personal.service';
import {
  CategoriasService,
  Categoria
} from '../../../core/services/categorias.service';

@Component({
  selector: 'app-cuidado-personal',
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
  templateUrl: './cuidado-personal.html',
  styleUrls: ['../inventario.css']
})
export class CuidadoPersonalComponent implements AfterViewInit {

  form!: FormGroup;
  categorias: Categoria[] = [];

  displayedColumns = [
    'codigo',
    'nombre',
    'marca',
    'categoria',
    'unidad_medida',
    'stock',
    'stock_minimo',
    'precio_compra',
    'precio_venta',
    'fecha_ingreso',
    'activo',
    'acciones'
  ];

  dataSource = new MatTableDataSource<CuidadoItem>();
  productos: CuidadoItem[] = [];
  filtroTexto = '';
  modoEdicion = false;
  codigoEditar: string | null = null;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private service: CuidadoPersonalService,
    private categoriasService: CategoriasService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {

    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      marca: [''],
      categoria: ['', Validators.required],
      unidad_medida: ['unidad', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [10, [Validators.required, Validators.min(0)]],
      precio_compra: [0, [Validators.required, Validators.min(0)]],
      precio_venta: [0, [Validators.required, Validators.min(0)]]
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
        this.productos = resp.data ?? [];
        this.dataSource.data = this.productos;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  cargarCategorias() {
    this.categoriasService.obtenerPorModulo('cuidado_personal').subscribe({
      next: ({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }
        this.categorias = data ?? [];
      },
      error: err => console.error(err)
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
      next: ({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }
        let codigo = 'CP-0001';
        if (data && data.length > 0) {
          const ultimo = data[0].codigo;
          const numero = parseInt(
            ultimo.replace('CP-', '')
          ) + 1;

          codigo =
            'CP-' +
            numero.toString().padStart(4, '0');
        }

        this.form.patchValue({
          codigo
        });
      },
      error: err => console.error(err)
    });
  }

  guardar() {
    const producto = this.form.value;
    if (this.modoEdicion) {
      this.service
        .actualizar(this.codigoEditar!, producto)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Producto actualizado',
              'Cerrar',
              { duration: 3000 }
            );
            this.reiniciar();
          },
          error: err => console.error(err)
        });
    } else {
      this.service
        .crear(producto)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Producto registrado',
              'Cerrar',
              { duration: 3000 }
            );
            this.reiniciar();
          },
          error: err => console.error(err)
        });
    }
  }

  editar(item: CuidadoItem) {
    this.modoEdicion = true;
    this.codigoEditar = item.codigo;
    this.form.patchValue(item);
  }

  eliminar(id: string) {
    if (!confirm('¿Desea eliminar este producto?')) {
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
      error: err => console.error(err)
    });

  }

  nuevoRegistro() {
    this.reiniciar();
  }

  private reiniciar() {
    this.form.reset({
      unidad_medida: 'unidad',
      stock: 0,
      stock_minimo: 10,
      precio_compra: 0,
      precio_venta: 0
    });
    this.modoEdicion = false;
    this.codigoEditar = null;
    this.generarCodigo();
    this.cargarDatos();
  }

}