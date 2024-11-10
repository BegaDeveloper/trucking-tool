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
import { MatDividerModule } from '@angular/material/divider';
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
    MatDividerModule,
  ],
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss'],
})
export class ToolComponent implements OnInit {
  toolForm!: FormGroup;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.toolForm = this.fb.group({
      exportImportToggle: [false],
      pickupType: ['', Validators.required],
      pickupLocation: ['', Validators.required],
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
    const dialogRef = this.dialog.open(ResultDialogComponent, {
      data: { result },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.toolForm.reset();
      this.toolForm.markAsPristine();
      this.toolForm.markAsUntouched();
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
    const pickupLocation = this.toolForm.get('pickupLocation')?.value;
    const pickupType = this.toolForm.get('pickupType')?.value;
    const accessToken = 'pk.25d5611af7c1840bcbcfb1b23b28b1c0';

    try {
      const pickupResponse = await axios.get(
        `https://us1.locationiq.com/v1/search.php?key=${accessToken}&q=${encodeURIComponent(
          pickupLocation
        )}&format=json`
      );
      const destinationResponse = await axios.get(
        `https://us1.locationiq.com/v1/search.php?key=${accessToken}&q=${encodeURIComponent(
          destination
        )}&format=json`
      );

      if (pickupResponse.data.length && destinationResponse.data.length) {
        const pickupCoords = [
          parseFloat(pickupResponse.data[0].lat),
          parseFloat(pickupResponse.data[0].lon),
        ];
        const destinationCoords = [
          parseFloat(destinationResponse.data[0].lat),
          parseFloat(destinationResponse.data[0].lon),
        ];

        const distanceResponse = await axios.get(
          `https://us1.locationiq.com/v1/directions/driving/${pickupCoords[1]},${pickupCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?key=${accessToken}&overview=false`
        );

        if (
          distanceResponse.data.routes &&
          distanceResponse.data.routes.length
        ) {
          const distance = distanceResponse.data.routes[0].distance / 1609.34; // Convert meters to miles
          const cost = distance * 2 * 2 + 0.34 * distance * 2; // Calculating cost with $2 per mile + 34% fuel surcharge
          const costString = `Total cost for the trip is $${cost.toFixed(2)}`;
          this.openResultDialog(costString);
        } else {
          this.openResultDialog('No route found between the locations.');
        }
      } else {
        this.openResultDialog('Invalid pickup location or destination.');
      }
    } catch (error) {
      console.error('Error calculating route', error);
      this.openResultDialog('An error occurred while calculating the route.');
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
