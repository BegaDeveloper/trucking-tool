import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import axios from 'axios';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResultDialogComponent } from '../../dialogs/result-dialog.component';

@Component({
  selector: 'app-tool',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss'],
})
export class ToolComponent implements OnInit {
  toolForm!: FormGroup;
  foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.toolForm = this.fb.group({
      exportImportToggle: [false],
      port: ['', Validators.required],
      destination: ['', Validators.required],
      containerType: ['', Validators.required],
      shippingLine: ['', Validators.required],
      weight: [0, [Validators.required, Validators.min(0)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  openResultDialog(result: string): void {
    this.dialog.open(ResultDialogComponent, {
      data: { result },
    });
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return `${value}`;
  }

  async calculateRoute() {
    const destination = this.toolForm.get('destination')?.value;
    const port = this.toolForm.get('port')?.value;
    const accessToken = 'pk.25d5611af7c1840bcbcfb1b23b28b1c0';

    try {
      const portResponse = await axios.get(
        `https://us1.locationiq.com/v1/search.php?key=${accessToken}&q=${port}&format=json`
      );
      const destinationResponse = await axios.get(
        `https://us1.locationiq.com/v1/search.php?key=${accessToken}&q=${destination}&format=json`
      );

      if (portResponse.data.length && destinationResponse.data.length) {
        const portCoords = [
          parseFloat(portResponse.data[0].lat),
          parseFloat(portResponse.data[0].lon),
        ];
        const destinationCoords = [
          parseFloat(destinationResponse.data[0].lat),
          parseFloat(destinationResponse.data[0].lon),
        ];

        const distanceResponse = await axios.get(
          `https://us1.locationiq.com/v1/directions/driving/${portCoords[1]},${portCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?key=${accessToken}&overview=false`
        );

        if (distanceResponse.data.routes.length) {
          const distance = distanceResponse.data.routes[0].distance / 1609.34; // convert meters to miles
          const cost = distance * 2 * 2 + 0.34 * distance * 2; // Calculating cost with $2 per mile + 34% fuel surcharge
          const costString = `Total cost for the trip is $${cost.toFixed(2)}`;
          this.openResultDialog(costString);
        }
      }
    } catch (error) {
      console.error('Error calculating route', error);
    }
  }

  onSubmit() {
    if (this.toolForm.valid) {
      console.log('Form values:', this.toolForm.value);
      this.calculateRoute();
    } else {
      console.error('Form is invalid');
    }
  }
}
