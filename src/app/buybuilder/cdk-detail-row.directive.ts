import { Directive, HostBinding, HostListener, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[cdkDetailRow]'
})
export class CdkDetailRowDirective {
  private row: any;
  private tRef: TemplateRef<any>;
  private opened: boolean;

  @HostBinding('class.expanded')
  get expended(): boolean {
    return this.opened;
  }

  @Input()
  set cdkDetailRow(value: any) {
    if (value !== this.row) {
      this.row = value;
      // this.render();
    }
  }

  @Input('cdkDetailRowTpl')
  set template(value: TemplateRef<any>) {
    if (value !== this.tRef) {
      this.tRef = value;
      // this.render();
    }
  }

  constructor(public vcRef: ViewContainerRef) { }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    let n=0;
    n=document.getElementsByClassName("arrow-down").length;
      for ( let i = 0; i < n; i++) {
        //const element = array[index];
        if(event.target['classList'].contains('caret-arrow') || event.target['classList'].contains('expandclass')) {
          if(event.target == document.getElementsByClassName("arrow-down")[i] || event.target == document.getElementsByClassName('caret-arrow')[i] || event.target == document.getElementsByClassName('expandclass')[i]){
            this.toggle();
            let downarrow = document.getElementsByClassName('caret-arrow')[i];
            if(downarrow != null && downarrow != undefined){
              if(downarrow.classList.contains("fa-caret-down") ){
                downarrow.classList.remove('fa-caret-down');
                downarrow.classList.add('fa-caret-up');   
              }
              else if(downarrow.classList.contains("fa-caret-up") ){
                downarrow.classList.remove('fa-caret-up');
                downarrow.classList.add('fa-caret-down');   
              }        
            }    
          } else {
            let downarrow = document.getElementsByClassName('caret-arrow')[i];
            if(downarrow != null && downarrow != undefined){
              if(downarrow.classList.contains("fa-caret-up") ) {
                downarrow.classList.remove('fa-caret-up');
                downarrow.classList.add('fa-caret-down');   
              }        
            } 
          }
        } 
      }
    }


  toggle(): void {
    if (this.row && this.row.isExpanded) {
      this.render();
    } else {
      this.vcRef.clear();
    }
    this.opened = this.vcRef.length > 0;
  }

  private render(): void {
    this.vcRef.clear();
    if (this.tRef && this.row) {
      this.vcRef.createEmbeddedView(this.tRef, { $implicit: this.row });
    }
  }
}
