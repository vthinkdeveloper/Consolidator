import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[NumberonlywithoutdotsDirective]'
})
export class NumberonlywithoutdotsDirective {

  constructor(private elRef: ElementRef) {}

  @HostListener('input', ['$event']) onChange(event) {
    const initalValue = this.elRef.nativeElement.value;
    this.elRef.nativeElement.value = initalValue.replace(/[^0-9]/g, '');
    if ( initalValue !== this.elRef.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
