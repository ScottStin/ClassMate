import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'welcome',
    loadChildren: async () =>
      (await import('./pages/welcome-page/welcome-page.module'))
        .WelcomePageModule,
  },
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
    path: 'school',
    loadChildren: async () =>
      (await import('./pages/login-page/login-page.module')).LoginPageModule,
  },
  {
    path: '',
    loadChildren: async () =>
      (await import('./pages/main-page/main-page.module')).MainPageModule,
  },

  // Wildcard route for unknown paths
  {
    path: '**',
    redirectTo: '', // redirect to homepage
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
