import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponent } from './explore-container.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, GoogleMapsModule],
  declarations: [ExploreContainerComponent],
  exports: [ExploreContainerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExploreContainerComponentModule {}
