import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { ContainerComponent } from './layout/container/container.component';

export const routes: Routes = [
   {
    path: '',
    component: ContainerComponent,
    children: [
      {
        path: 'map',
        component: MapComponent
      }
    ]
  }
];
