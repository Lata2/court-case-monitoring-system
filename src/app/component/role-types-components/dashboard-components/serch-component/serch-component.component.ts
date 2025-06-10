import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-serch-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './serch-component.component.html',
  styleUrls: ['./serch-component.component.css']
})
export class SerchComponentComponent implements OnInit {
  form: FormGroup;
  caseNatures: any[] = [];
  years: { year: number }[] = [];
  types: { type_id: number, type_name: string }[] = [];

  constructor(private ds: DataService, private fb: FormBuilder) {
    this.form = this.fb.group({
      case_type: [null],
      caseNo: [''],
      case_year: [null],
      petitionerName: [''],
      type: [null]
    });
  }

  ngOnInit(): void {
    this.getCaseNature();
    this.years = this.generateYears();
    this.types = this.getCaseTypes();
  }

  getCaseNature() {
    this.ds.getData('add_case/case_natures').subscribe({
      next: (res: any) => {
        const data = res?.data ?? res; // fallback
        this.caseNatures = Array.isArray(data) ? data : [];
        if (!Array.isArray(this.caseNatures)) {
          console.error('Invalid case nature format:', res);
          this.caseNatures = [];
        }
      },
      error: (err) => {
        console.error('Error fetching case natures:', err);
        this.caseNatures = [];
      }
    });
  }

  generateYears(): { year: number }[] {
    const currentYear = new Date().getFullYear();
    const yearsList: { year: number }[] = [];
    for (let i = currentYear; i >= currentYear - 100; i--) {
      yearsList.push({ year: i });
    }
    return yearsList;
  }

  getCaseTypes(): { type_id: number, type_name: string }[] {
    return [
      { type_id: 1, type_name: 'All' },
      { type_id: 2, type_name: 'Petition Case' },
      { type_id: 3, type_name: 'Up to 7 Days' },
      { type_id: 4, type_name: 'Next Hearing Date' },
      { type_id: 5, type_name: 'Contempt Cases' },
    ];
  }

  search() {
    console.log('Form values:', this.form.value);
  }
}
