import { Component, OnInit, Inject } from '@angular/core';

import { MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import { MatSnackBar} from '@angular/material/snack-bar';
@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.scss']
})
export class ToastMessageComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
              public snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

}
