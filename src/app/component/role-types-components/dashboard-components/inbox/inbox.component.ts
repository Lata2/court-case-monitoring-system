import { Component } from '@angular/core';

import { CommonModule } from '@angular/common'; // ✅ Use CommonModule instead
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inbox',
  standalone: true, // ✅ Standalone component banane ke liye
  imports: [ CommonModule, FormsModule], 
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css', '../dashboard-home/dashboard-home.component.css']
})
export class InboxComponent {
  searchType: string = 'case';
}
