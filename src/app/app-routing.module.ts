import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BuywindowComponent } from './buybuilder/buywindow/buywindow.component';
import { AuthGuard } from './_guards/auth.guard';
import {CreateProgramComponent} from './programbuilder/create-program/create-program.component';
import {ProgramOrderComponent} from './programOrder/program-order/program-order.component';
import {ProgramDashboardComponent} from './programDashboard/program-dashboard/program-dashboard.component';
import { EditOrderComponent } from './edit-order/edit-order.component';
import { LandingpageComponent } from  './landingpage/landingpage.component';
import { ManageProgramComponent } from  './manageProgram/manage-program/manage-program.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AssignUsersComponent } from './assign-users/assign-users.component';
import { ModifyProgramMobileComponent } from './modify-program-mobile/modify-program-mobile.component';
import { CopyExistingItemMobileComponent } from './copy-existing-item-mobile/copy-existing-item-mobile.component';
import { CreateFormioComponent } from './create-formio/create-formio.component';

const routes: Routes = [  
  { path: '', redirectTo: 'home', pathMatch: 'full' } ,
  { path: 'access_token', component: HomeComponent, canActivate: [AuthGuard], },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], },
  { path: 'buywindow', component: BuywindowComponent },
  {path: 'create-program', component: CreateProgramComponent, canActivate: [AuthGuard],},
  {path: 'program-order', component: ProgramOrderComponent, canActivate: [AuthGuard]},
  {path: 'program-dashboard', component: ProgramDashboardComponent, canActivate: [AuthGuard]},
  {path: 'edit-order', component: EditOrderComponent, canActivate: [AuthGuard]},
  {path: 'landing', component: LandingpageComponent, canActivate: [AuthGuard]},
  {path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard]},
  {path: 'assign-dashboard', component: AssignUsersComponent, canActivate: [AuthGuard]},
  {path: 'manage-program', component: ManageProgramComponent, canActivate: [AuthGuard]},
  {path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard]},
  {path: 'modify-program-mobile', component: ModifyProgramMobileComponent, canActivate: [AuthGuard]},
  {path: 'copy-existing-item',component: CopyExistingItemMobileComponent, canActivate: [AuthGuard]},
  {path: 'create-formio',component: CreateFormioComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' }), ],
  exports: [RouterModule]
})
export class AppRoutingModule { 

}
