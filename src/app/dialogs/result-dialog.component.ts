import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-result-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatIconModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Calculation Result</h2>
    <mat-dialog-content class="mat-typography">
      <div class="result-icon">
        <mat-icon color="primary">check_circle</mat-icon>
      </div>
      <p>{{ data.result }}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onClose()" color="primary">Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .result-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 10px;
      }
      mat-icon {
        font-size: 25px;
      }
    `,
  ],
})
export class ResultDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { result: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
