import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'clients',
    loadChildren: () => import('./pages/clients/clients.module').then(m => m.ClientsPageModule)
  },
  {
    path: 'pets',
    loadChildren: () => import('./pages/pets/pets.module').then(m => m.PetsPageModule)
  },
  {
    path: 'appointments',
    loadChildren: () => import('./pages/agenda/appointments.module').then(m => m.AppointmentsPageModule)
  },
  {
    path: 'hotel',
    loadChildren: () => import('./pages/hotel/hotel.module').then(m => m.HotelPageModule)
  },
  {
    path: 'sales',
    loadChildren: () => import('./pages/vendas/sales.module').then(m => m.SalesPageModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./pages/estoque/products.module').then(m => m.ProductsPageModule)
  },
  {
    path: 'services',
    loadChildren: () => import('./pages/servicos/services.module').then(m => m.ServicesPageModule)
  },
  {
    path: 'employees',
    loadChildren: () => import('./pages/funcionarios/employees.module').then(m => m.EmployeesPageModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./pages/relatorio/reports.module').then(m => m.ReportsPageModule)
  },
  {
    path: 'whatsapp',
    loadChildren: () => import('./pages/whatsapp/whatsapp.module').then(m => m.WhatsappPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

