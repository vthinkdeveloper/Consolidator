import { NgModule,APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { APP_BASE_HREF } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './_guards/auth.guard';
import { AuthService } from './services/auth.service';
import { getDatePickerConfig } from './services/common/app-common';
import { AuthInterceptor } from './services/auth.interceptor';
import { environment } from '../environments/environment';
import { BuywindowListComponent } from './buybuilder/buywindow-list/buywindow-list.component';
import { MatTableModule } from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CdkDetailRowDirective } from './buybuilder/cdk-detail-row.directive';
import {MatTabsModule} from '@angular/material/tabs'
import { from } from 'rxjs';
import { BuywindowComponent } from './buybuilder/buywindow/buywindow.component';
import { ConfirmPopupComponent } from './confirm-popup/confirm-popup.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { ToastMessageComponent } from './toast-message/toast-message.component';
import { CreateProgramComponent } from './programbuilder/create-program/create-program.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DragDropDirective } from './programbuilder/drag-and-drop/drag-drop.directive';
import { ProgramDetailsComponent } from './buybuilder/program-details/program-details.component';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { CopyExistingProgramComponent } from './programbuilder/copy-existing-program/copy-existing-program.component';
import { ModifyProgramComponent } from './programbuilder/modify-program/modify-program.component';
import { ImageCardComponent } from './image-card/image-card.component';
import { NumbersOnlyInputDirective } from './numbers-only-input.directive';
import { HeaderComponent } from './header/header.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog'
import { ViewModelComponent } from './view-model/view-model.component';
import { ProgramOrderComponent } from './programOrder/program-order/program-order.component';
import { ModalOrderpageComponent } from './programOrder/modal-orderpage/modal-orderpage.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProgramDashboardComponent } from './programDashboard/program-dashboard/program-dashboard.component';
import { ProgramListComponent } from './programDashboard/program-list/program-list.component';
import { EditOrderComponent } from './edit-order/edit-order.component';
import { FooterComponent } from './footer/footer.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { MatToolbarModule } from  '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule  } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { ManageProgramComponent } from './manageProgram/manage-program/manage-program.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AssignUsersComponent } from './assign-users/assign-users.component';
import { PublishedProgramListComponent } from './manageProgram/published-program-list/published-program-list.component';
import { AssignLocationComponent } from './assign-location/assign-location.component';
import { MatTreeModule } from '@angular/material/tree';
import { NumberonlywithoutdotsDirective } from './numberonlywithoutdots.directive';
import { ModifyProgramMobileComponent } from './modify-program-mobile/modify-program-mobile.component';
import { CopyExistingItemMobileComponent } from './copy-existing-item-mobile/copy-existing-item-mobile.component';
import { FormioModule } from '@formio/angular';
import { CreateFormioComponent } from './create-formio/create-formio.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BuywindowListComponent,
    CdkDetailRowDirective,
    BuywindowComponent,
    ConfirmPopupComponent,
    ToastMessageComponent,
    CreateProgramComponent,
    DragDropDirective,
    ProgramDetailsComponent,
    CopyExistingProgramComponent,
    ModifyProgramComponent,
    ImageCardComponent,
    NumbersOnlyInputDirective,
    HeaderComponent,
    ViewModelComponent,
    ProgramOrderComponent,
    ModalOrderpageComponent,
    ProgramDashboardComponent,
    ProgramListComponent,
    EditOrderComponent,
    FooterComponent,
    LandingpageComponent,
    AdminDashboardComponent,
    AssignUsersComponent,
    ManageProgramComponent,
    AdminDashboardComponent,
    PublishedProgramListComponent,
    AssignLocationComponent,
    LandingpageComponent,
    NumberonlywithoutdotsDirective,
    ModifyProgramMobileComponent,
    CopyExistingItemMobileComponent,
    CreateFormioComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatSnackBarModule,
    AngularEditorModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatListModule,
    MatTreeModule,
    MatButtonModule,
    FormioModule 
  ],
  exports: [
    NumbersOnlyInputDirective,
    NumberonlywithoutdotsDirective
  ],
  providers: [
    AuthService,
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: APP_BASE_HREF, useValue: environment.baseHref },
    { provide: BsDatepickerConfig, useFactory: getDatePickerConfig }   ,
    DatePipe,
    CurrencyPipe
    ],
    entryComponents: [ViewModelComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
