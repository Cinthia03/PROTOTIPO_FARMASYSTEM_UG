import { Routes } from '@angular/router'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login')
        .then(m => m.Login)
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./features/inicio/inicio')
        .then(m => m.InicioComponent)
  },
  {
    path: 'inventario',
    loadComponent: () =>
      import('./features/inventario/inventario')
        .then(m => m.InventarioComponent)
  },
  {
    path: 'medicamentos',
    loadComponent: () =>
      import('./features/inventario/medicamentos/medicamentos')
        .then(m => m.Medicamentos)
  },
  {
    path: 'insumos',
    loadComponent: () =>
      import('./features/inventario/insumos/insumos')
        .then(m => m.Insumos)
  },
  {
    path: 'cuidado-personal',
    loadComponent: () =>
      import('./features/inventario/cuidado-personal/cuidado-personal')
        .then(m => m.CuidadoPersonalComponent)
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./features/reportes/reportes')
        .then(m => m.Reportes)
  },
  {
    path: 'ventas',
    loadComponent: () =>
      import('./features/ventas/ventas')
        .then(m => m.Ventas)
  }
]
