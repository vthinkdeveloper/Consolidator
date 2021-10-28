import { Component, OnInit, Input, ViewChild, TemplateRef, EventEmitter, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-confirm-popup',
  templateUrl: './confirm-popup.component.html',
  styleUrls: ['./confirm-popup.component.scss']
})
export class ConfirmPopupComponent implements OnInit {
  @ViewChild('archiveElement') archiveConfirmRef: TemplateRef<any>;
  @Output() okbuttonClicked = new EventEmitter<string>();
  @Output() cancelButtonClicked = new EventEmitter<string>();
  @Input() popupObject: any;
  modalRef: BsModalRef;
  assetPath: string=environment.assetBasePath;

  constructor(private modalService: BsModalService) { }

  ngOnInit(): void {
    
  }

  openPopup(){
    this.modalRef = this.modalService.show(this.archiveConfirmRef, { class: 'model-confirm-popup'});
  }

  okClicked() {
   this.okbuttonClicked.emit();
  }

  cancelClicked() {
    this.modalRef.hide();
    this.cancelButtonClicked.emit();
  }

}
