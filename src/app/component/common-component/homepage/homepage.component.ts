import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // ✅ RouterModule import करें

@Component({
  selector: 'app-homepage',
  standalone: true,  
  imports: [RouterModule],  
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent { 

}
