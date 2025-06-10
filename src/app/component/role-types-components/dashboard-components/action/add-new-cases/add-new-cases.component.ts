// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { FormsModule } from '@angular/forms';
// import { NgSelectModule } from '@ng-select/ng-select';
// import { DataService } from '../../../../services/data.service';
// import { timer, throwError } from 'rxjs';
// import { raceWith, switchMap, catchError } from 'rxjs/operators';
// import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

// @Component({
//   selector: 'app-add-new-cases',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, HttpClientModule], // Use HttpClientModule here
//   templateUrl: './add-new-cases.component.html',
//   styleUrls: ['./add-new-cases.component.css', '../../admin-dashboard/menu-control/menu-control.component.css'],
// })
// export class AddNewCasesComponent implements OnInit {
//   addCaseForm!: FormGroup;
//   currentYear = new Date().getFullYear();
//   years: number[] = [];
//   caseNatures: any[] = [];
//   courts: any[] = [];
//   searchText: string = '';
//   data: any;
//   submitted = false;
//   showResults = false;
// dept_id: string = '';
//   user_code: number= 0;
//   role_id: string ="";
//   loading = false;
//   timeoutOccurred = false;
//   est_code:string=''

//   constructor(private fb: FormBuilder, private ds: DataService) {}

//   ngOnInit(): void {
//     this.initializeForm();
//     this.populateYears();
//     this.loadDropdowns();
//     this.initializeSession();
//   }

//     private initializeSession(): void {
//     this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
//       next: (res: any) => {
//         this.role_id = res.role_id;
//         this.dept_id = res.dept_id;
//         this.user_code = res.user_code;
       
//       },
//       error: (err) => {
//         console.error('Error fetching session:', err);
//       }
//     });
//   }

//   initializeForm(): void {
//     this.addCaseForm = this.fb.group({
//       court_name: ['', Validators.required],
//       case_type: ['', Validators.required],
//       case_no: [
//         '',
//         [Validators.required, Validators.pattern(/^[1-9][0-9]{0,4}$/)]
//       ],
//       case_year: ['', Validators.required]
//     });
//   }

//   get caseNoControl() {
//     return this.addCaseForm.get('case_no');
//   }

//   allowOnlyNumbers(event: KeyboardEvent): void {
//     const inputChar = String.fromCharCode(event.keyCode || event.which);
//     const currentValue = this.caseNoControl?.value || '';
//     const newValue = currentValue + inputChar;
//     const isValid = /^[1-9][0-9]{0,4}$/.test(newValue);

//     if (!/^[0-9]$/.test(inputChar) || !isValid) {
//       event.preventDefault();
//     }
//   }

//   populateYears(): void {
//     const customTopYear = 2025;
//     this.years.push(customTopYear);

//     for (let year = this.currentYear; year >= 1900; year--) {
//       if (year !== customTopYear) {
//         this.years.push(year);
//       }
//     }
//   }

//   loadDropdowns(): void {
//     this.ds.getData('add_case/case_natures').subscribe((res: any) => {
//       this.caseNatures = res;
//     });

//     this.ds.getData('add_case/courts').subscribe((res: any) => {
//       this.courts = res;
//     });
//   }

//   onSubmit(): void {
//     if (this.addCaseForm.invalid) {
//       alert('Please fill in all required fields.');
//       return;
//     }

//     const selectedCourtId = this.addCaseForm.value.court_name;
//     const courtObj = this.courts.find(c => c.est_id === selectedCourtId);

//     if (!courtObj || !courtObj.est_code) {
//       console.error('Error: est_code is missing.');
//       return;
//     }

//     const est_code = courtObj.est_code;
    
//     const case_type_id = this.addCaseForm.value.case_type;
//     const reg_no = this.addCaseForm.value.case_no;
//     const reg_year = this.addCaseForm.value.case_year;

//     const requestStr = `est_code=${est_code}|case_type=${case_type_id}|reg_year=${reg_year}|reg_no=${reg_no}`;

//     const payload = {
//       apiName: 'hc-case-search-api/casesearch',
//       requestStr: requestStr
//     };

//     this.loading = true;
//     this.showResults = false;
//     this.timeoutOccurred = false;

//     // Create API call observable
//     const apiCall$ = this.ds.postData('getCaseDetails', payload).pipe(
//       catchError(error => throwError(() => error))
//     );

//     // Create 5-second timeout observable
//     const timeout$ = timer(5000).pipe(
//       switchMap(() => throwError(() => 'Request timed out. Please try again.'))
//     );

//     // Race between API call and timeout
//     apiCall$.pipe(
//       raceWith(timeout$)
//     ).subscribe({
//       next: (res) => {
//         console.log('Full API Response:', res);
//         const cino = res?.casenos?.case1?.cino;

//         if (cino) {
//           sessionStorage.setItem('cino', '1');
//           console.log('Session Storage me CINO store kiya gaya:', cino);
//         }

//         if (res && res.casenos) {
//           const establishment_name = res.establishment_name;
//           this.data = Object.values(res.casenos).map((item: any) => ({
//             ...item,
//             establishment_name: establishment_name
//           }));
//         } else {
//           this.data = [];
//         }
//         this.loading = false;
//         this.showResults = true;
//       },
//       error: (err) => {
//         this.loading = false;
//         if (err === 'Request timed out. Please try again.') {
//           this.timeoutOccurred = true;
//           this.data = [];
//           this.showResults = true;
//         } else {
//           console.error('Error fetching data:', err);
//           this.data = [];
//           this.showResults = true;
//         }
//       }
//     });
//   }

//   addCaseToDashboard(item: any): void {
//     const cinoFromSession = sessionStorage.getItem('cino');


//     const payload = {
//       cino: item.cino,
//       pet_name: item.pet_name,
//       est_code: item.est_code,
//       establishment_name: item.establishment_name,
//       cino_exits: cinoFromSession, 
//       user_code:this.user_code,
//       dept_id:this.dept_id
//     };
//     console.log(payload,"payload");
    

//     this.ds.postData('btnsave', payload, { withCredentials: true }).subscribe({
//       next: (res) => {
//         console.log('Saved to dashboard successfully:', res);
//         alert(res.message);
//       },
//       error: (error) => {
//         console.error('Failed to save case:', error);
//         alert(error.message);
//       }
//     });
//   }

//   resetForm(): void {
//     this.addCaseForm.reset();
//     this.submitted = false;
//     this.data = [];
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataService } from '../../../../../services/data.service';
import { timer, throwError } from 'rxjs';
import { raceWith, switchMap, catchError } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-add-new-cases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    HttpClientModule
  ],
  templateUrl: './add-new-cases.component.html',
  styleUrls: ['./add-new-cases.component.css', '../../../admin-component/menu-control/menu-control.component.css'],
})
export class AddNewCasesComponent implements OnInit {
  addCaseForm!: FormGroup;
  currentYear = new Date().getFullYear();
  years: number[] = [];
  caseNatures: any[] = [];
  courts: any[] = [];
  searchText: string = '';
  data: any;
  submitted = false;
  showResults = false;

  dept_id: string = '';
  user_code: number = 0;
  role_id: string = '';
  loading = false;
  timeoutOccurred = false;

  constructor(private fb: FormBuilder, private ds: DataService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.populateYears();
    this.loadDropdowns();
    this.initializeSession();
  }

  private initializeSession(): void {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.role_id = res.role_id;
        this.dept_id = res.dept_id;
        this.user_code = res.user_code;
      },
      error: (err) => {
        console.error('Error fetching session:', err);
      }
    });
  }

  initializeForm(): void {
    this.addCaseForm = this.fb.group({
      court_name: ['', Validators.required],
      case_type: ['', Validators.required],
      case_no: [
        '',
        [Validators.required, Validators.pattern(/^[1-9][0-9]{0,4}$/)]
      ],
      case_year: ['', Validators.required]
    });
  }

  get caseNoControl() {
    return this.addCaseForm.get('case_no');
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.keyCode || event.which);
    const currentValue = this.caseNoControl?.value || '';
    const newValue = currentValue + inputChar;
    const isValid = /^[1-9][0-9]{0,4}$/.test(newValue);

    if (!/^[0-9]$/.test(inputChar) || !isValid) {
      event.preventDefault();
    }
  }

  populateYears(): void {
    const customTopYear = 2025;
    this.years.push(customTopYear);

    for (let year = this.currentYear; year >= 1900; year--) {
      if (year !== customTopYear) {
        this.years.push(year);
      }
    }
  }

  loadDropdowns(): void {
    this.ds.getData('add_case/case_natures').subscribe((res: any) => {
      this.caseNatures = res;
    });

    this.ds.getData('add_case/courts').subscribe((res: any) => {
      this.courts = res;
    });
  }

  onSubmit(): void {
    if (this.addCaseForm.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

    const selectedCourtId = this.addCaseForm.value.court_name;
    const courtObj = this.courts.find(c => c.est_id === selectedCourtId);

    if (!courtObj || !courtObj.est_code) {
      console.error('Error: est_code is missing.');
      return;
    }

    const est_code = courtObj.est_code;
    const case_type_id = this.addCaseForm.value.case_type;
    const reg_no = this.addCaseForm.value.case_no;
    const reg_year = this.addCaseForm.value.case_year;

    const requestStr = `est_code=${est_code}|case_type=${case_type_id}|reg_year=${reg_year}|reg_no=${reg_no}`;

    const payload = {
      apiName: 'hc-case-search-api/casesearch',
      requestStr: requestStr
    };

    this.loading = true;
    this.showResults = false;
    this.timeoutOccurred = false;

    const apiCall$ = this.ds.postData('getCaseDetails', payload).pipe(
      catchError(error => throwError(() => error))
    );

    const timeout$ = timer(5000).pipe(
      switchMap(() => throwError(() => 'Request timed out. Please try again.'))
    );

    apiCall$.pipe(
      raceWith(timeout$)
    ).subscribe({
      next: (res) => {
        console.log('Full API Response:', res);
        const cino = res?.casenos?.case1?.cino;

        if (cino) {
          sessionStorage.setItem('cino', '1');
          console.log('Session Storage me CINO store kiya gaya:', cino);
        }

        if (res && res.casenos) {
          const establishment_name = res.establishment_name;

          this.data = Object.values(res.casenos).map((item: any) => ({
            ...item,
            establishment_name: establishment_name,
            est_code: est_code // Add est_code manually here
          }));
        } else {
          this.data = [];
        }

        this.loading = false;
        this.showResults = true;
      },
      error: (err) => {
        this.loading = false;
        if (err === 'Request timed out. Please try again.') {
          this.timeoutOccurred = true;
          this.data = [];
          this.showResults = true;
        } else {
          console.error('Error fetching data:', err);
          this.data = [];
          this.showResults = true;
        }
      }
    });
  }

  addCaseToDashboard(item: any): void {
    const cinoFromSession = sessionStorage.getItem('cino');

    const payload = {
      cino: item.cino,
      pet_name: item.pet_name,
      est_code: item.est_code, // now this will be present
      establishment_name: item.establishment_name,
      cino_exits: cinoFromSession,
      user_code: this.user_code,
      dept_id: this.dept_id
    };

    console.log("Payload:", payload);

    this.ds.postData('btnsave', payload, { withCredentials: true }).subscribe({
      next: (res) => {
        console.log('Saved to dashboard successfully:', res);
        alert(res.message);
      },
      error: (error) => {
        console.error('Failed to save case:', error);
        alert(error.message);
      }
    });
  }

  resetForm(): void {
    this.addCaseForm.reset();
    this.submitted = false;
    this.data = [];
  }
}
