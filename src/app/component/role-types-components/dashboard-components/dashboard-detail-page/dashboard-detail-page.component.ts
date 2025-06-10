import { Component } from '@angular/core';
import { SerchComponentComponent } from '../serch-component/serch-component.component';
@Component({
  selector: 'app-dashboard-detail-page',
  standalone: true,
  imports: [SerchComponentComponent],
  templateUrl: './dashboard-detail-page.component.html',
  styleUrls: ['./dashboard-detail-page.component.css']
})
export class DashboardDetailPageComponent {}

