import { Component, OnInit, ViewChild } from '@angular/core';
import { FormioService } from '../services/formio/formio.service';
import { FormioComponent } from '@formio/angular';
import { AppCommonFunctions } from '../services/common/app-common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-formio',
  templateUrl: './create-formio.component.html',
  styleUrls: ['./create-formio.component.scss']
})
export class CreateFormioComponent implements OnInit {
  formDefinition: any;
  formIoKey: any;
  @ViewChild(FormioComponent, { static: false }) form: FormioComponent;
  public resourceMessage: any;
  assetPath: string=environment.assetBasePath;
  constructor(public formioService: FormioService, public appCommonFunctions: AppCommonFunctions) { }

  ngOnInit(): void {
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    this.getFormioService();
  }

  getFormioService() {
    
    this.formDefinition = {}
    return new Promise((resolve, reject) => {
    // this.appCommonFunctions.showLoader('loadingSpinnerContainerprogram');
    this.formIoKey = JSON.parse(sessionStorage.getItem('ConsolidatorConfig')) &&  JSON.parse(sessionStorage.getItem('ConsolidatorConfig'))['formKeys']
    if(!this.formIoKey || !this.formIoKey["programAttributes"]) {
      return
     
    }
    document.getElementById('loadingSpinnerContainerOrder').style.display='block'
    this.formioService.getFormDefinition(this.formIoKey["programAttributes"]).subscribe(response => {
      // this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      this.formDefinition = JSON.parse(JSON.stringify(response));
      resolve(true);
      document.getElementById('loadingSpinnerContainerOrder').style.display='none'
    }, (err) => {
      this.formDefinition = {}
      // this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      resolve(true);
      document.getElementById('loadingSpinnerContainerOrder').style.display='none'
    })
  })
}

// onFormChange(event) {
//   this.formDefinition = event.form;
// }

saveChanges() {
  document.getElementById('loadingSpinnerContainerOrder').style.display='block'
  return new Promise((resolve, reject) => {
  this.formioService.updateTenantForm(this.formDefinition,this.formIoKey["programAttributes"]).subscribe(response => {
    document.getElementById('loadingSpinnerContainerOrder').style.display='none'
  }, (err) => {
    // this.formDefinition = {};
    document.getElementById('loadingSpinnerContainerOrder').style.display='none'
    // this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
    resolve(true);
  })
 })
}
}
