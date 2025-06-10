// import { Component } from '@angular/core';
// import { RouterModule } from '@angular/router';
// import { ReactiveFormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

// import { DynamicTableComponent } from './component/dynamic-table/dynamic-table.component';
// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [
//     RouterModule,
//     HttpClientModule,
//     ReactiveFormsModule,
//     // DynamicTableComponent

//   ],
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'my-angular-app';
// }



import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DataService } from './services/data.service';
import { LoadingSpinnerComponent } from './component/common-component/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
    // AllotementAllocateDetailsComponent
    // DynamicTableComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'my-angular-app';

  constructor(private http: HttpClient, private router: Router,private ds:DataService ) {}

  // ngOnInit(): void {
  //   setInterval(() => {
  //     this.ds.getData('/session-status', { withCredentials: true }).subscribe({
  //       next: () => {
  //         // Session is alive → do nothing
  //       },
  //       error: (err) => {
  //         if (err.status === 401) {
  //           console.warn('Session expired, logging out...');
  //           sessionStorage.clear();
  //           localStorage.clear();
  //           this.router.navigate(['/login']);
  //         }
         
  //       }
  //     });
  //   }, 6000); 
  // }
  ngOnInit(): void {
    setInterval(() => {
      const currentUrl = this.router.url;
  
      if (currentUrl === '/login') {
        // Don’t ping session when on login page
        return;
      }
  
      this.ds.getData('/session-status', { withCredentials: true }).subscribe({
        next: () => {
          console.log('Session is alive');
          // Session is alive → do nothing
        },
        error: (err) => {
          if (err.status === 401) {
            console.warn('Session expired, logging out...');
            sessionStorage.clear();
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      });
    }, 600000);
  }
  
}
