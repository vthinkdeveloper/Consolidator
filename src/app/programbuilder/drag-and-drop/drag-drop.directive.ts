import { Directive, Output, Input, EventEmitter, HostListener, HostBinding } from '@angular/core';
import { AppCommonFunctions } from '../../services/common/app-common';

@Directive({
  selector: '[appDragDrop]'
})
export class DragDropDirective {

  @Output() filesDropped = new EventEmitter();
  @Output() filesHovered = new EventEmitter();

  @Output() filesDroppedModifyElement = new EventEmitter();
  @Output() showInvalidErrorModifyElement = new EventEmitter();

  @Output() showInvalidError = new EventEmitter();

  @Output() uploadElementCreatePage = new EventEmitter();
  @Output() modifyProgramFileChange = new EventEmitter();

  @Input() isCreateNewProgram: boolean; 

  constructor(private appCommon: AppCommonFunctions) {
  }

  @HostBinding('style.border') private borderStyle = '2px dashed';
  @HostBinding('style.border-color') private borderColor = '#696D7D';
  @HostBinding('style.border-radius') private borderRadius = '5px';

  @HostListener('change',['$event.target.files'])
  onChanges(files) {
    if (files.length > 0) {
      let element = document.getElementById('fileId');
      if (element) {
        this.appCommon.sendUploadFiles(files);
      } else {
        this.uploadElementCreatePage.emit(files)
      }
      let elementValue = document.getElementById('fileIdValue');
      if (elementValue) {
        this.appCommon.sendUploadFiles(files);
      } 
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const element = event.target as HTMLInputElement
    element.value = ''
  }

  @HostListener('dragover', ['$event'])
    onDragOver($event) {
      $event.preventDefault();
      this.filesHovered.emit(true)
      this.borderColor = '#0075F4';
      this.borderStyle = '2px dashed';
    }
  
  @HostListener('drageleave', ['$event'])
    onDragLeave($event) {
      $event.preventDefault();
      this.filesHovered.emit(false)
    }

  @HostListener('drop', ['$event'])
    onDrop($event) {
      $event.preventDefault();
      if($event.dataTransfer.files.length > 1) {
        if(this.isCreateNewProgram) {
          //this.showInvalidError.emit('Please select one file.Multiple files not supported');
          this.showInvalidError.emit(1);
        } else {
          //this.showInvalidErrorModifyElement.emit('Please select one file.Multiple files not supported');
          this.showInvalidErrorModifyElement.emit(1);
        }
        
      } else {
        if(this.appCommon.checkImageFileUploaded($event.dataTransfer.files[0].name)) {
          if(this.isCreateNewProgram) {
            this.filesDropped.emit($event.dataTransfer.files);
          } else {
            this.filesDroppedModifyElement.emit($event.dataTransfer.files);
          }
        } else {
          if(this.isCreateNewProgram) {
            //this.showInvalidError.emit('Please select image file.Other files not supported');
            this.showInvalidError.emit(0);
          } else {
            this.showInvalidErrorModifyElement.emit(0);
          }
        }
      }   
      this.filesHovered.emit(false);
      this.borderColor = '#aaa';
      this.borderStyle = '2px dashed';
    }
}
