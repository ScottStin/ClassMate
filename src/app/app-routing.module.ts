import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'student',
    loadChildren: async () =>
      (await import('./pages/login-page/login-page.module')).LoginPageModule,
  },
  {
    path: 'teacher',
    loadChildren: async () =>
      (await import('./pages/login-page/login-page.module')).LoginPageModule,
  },
  {
    path: 'home',
    loadChildren: async () =>
      (await import('./pages/main-page/main-page.module')).MainPageModule,
  },
  // Add other routes here if needed
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // Wildcard route for unknown paths
  {
    path: '**',
    redirectTo: '/login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
