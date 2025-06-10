import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../../../services/data.service';
import { RouterModule } from '@angular/router';
import { MainHeaderComponent } from '../main-header/main-header.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
  imports: [CommonModule,RouterModule, ReactiveFormsModule, HttpClientModule, MainHeaderComponent]
})
export class OnboardingComponent implements OnInit {
  
  onboardingForm: FormGroup;
  departments: any[] = []; 
  data: any;

  constructor(private fb: FormBuilder, private ds: DataService) {
    this.onboardingForm = this.fb.group({
      dept_id: [ Validators.required],
      // dept_add: ['', Validators.required],
      nodal_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      nodal_desg: ['', Validators.required],
      nodal_email: ['', [Validators.required, Validators.email]],
      nodal_no: ['', [Validators.required,  Validators.minLength(10),Validators.pattern(/^[6789]\d{9}$/)]]
    });
  }

  ngOnInit(): void {
    this.getDepartmentName();
  }

  getDepartmentName(): void {
    this.ds.getData('onboarding').subscribe(
      (res: any) => {  
        this.departments = res; 
        console.log('Fetched Departments:', this.departments); // Debugging
      },
      (error: any) => {
        console.error('Error fetching department names:', error);
      }
    );
  }
  
  // Selected department store karne ke liye ek variable banayein
  selectedDept: any = null;
  
  onDepartmentChange(event: any) {
    const selectedDeptId = event.target.value;
    console.log('Selected Department ID:', selectedDeptId); // Debugging
  
    this.selectedDept = this.departments.find(dept => dept.dept_id == selectedDeptId);
    console.log('Selected Department:', this.selectedDept); // Debugging
  
    if (this.selectedDept) {
      this.onboardingForm.patchValue({ dept_add: this.selectedDept.dept_add });
    }
  }
  
  
  

  onSubmit(): void {
    if (this.onboardingForm.invalid) {
      this.onboardingForm.markAllAsTouched();
      return;
    }
  
    console.log('Form Data:', this.onboardingForm.value);
  
    this.ds.postData('onboarding', this.onboardingForm.value).subscribe(res => {
      this.data = res;
      if (this.data) {
        alert('Data Saved Successfully');
      }
    });
  }

  onClear() {
    this.onboardingForm.reset();
  }



  
  // onboardingForm = new FormGroup({
  //   dept_name: new FormControl('', Validators.required),
  //   dept_add: new FormControl('', Validators.required),
  //   nodal_name: new FormControl('', [
  //     Validators.required,
  //     Validators.pattern(/^[a-zA-Z\s]+$/) // Alphabets and spaces only
  //   ]),
  //   nodal_desg: new FormControl('', Validators.required),
  //   dept_email: new FormControl('', [
  //     Validators.required,
  //     Validators.email
  //   ]),
  //   nodal_no: new FormControl('', [
  //     Validators.required,
  //     Validators.pattern(/^[6789]\d{9}$/) // 10-digit mobile number validation
  //   ])

    
  // });
  
  
  restrictInput(event: KeyboardEvent, inputElement: HTMLInputElement) {
    const inputChar = event.key;
    
    // Agar pehla character hai to 0,1,2,3,4,5 ko block karo
    if (inputElement.value.length === 0 && /^[0-5]$/.test(inputChar)) {
      event.preventDefault();
      return;
    }
  
    // Sirf numbers 0-9 allow karo
    if (!/^[0-9]$/.test(inputChar)) {
      event.preventDefault();
    }
  }
  
  

  
  limitDigits(event: any) {
    let inputValue = event.target.value;
    if (inputValue.length > 10) {
      event.target.value = inputValue.slice(0, 10); 
      this.onboardingForm.get('nodal_no')?.setValue(event.target.value); 
    }
  }
}
