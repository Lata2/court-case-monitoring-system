import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import { FilePdfTwoTone } from '@ant-design/icons-angular/icons';
import { NzIconModule, NzIconService } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-ag-dispatch',
  standalone: true,
  imports: [CommonModule,  ReactiveFormsModule, NzIconModule],
  templateUrl: './ag-dispatch.component.html',
  styleUrl: './ag-dispatch.component.css'
})
export class AgDispatchComponent implements OnInit {

  filterForm!: FormGroup;
  dispatchCases: any[] = [];
  filteredCases: any[] = [];
  concernData: any[] = [];
  departments = ['Home', 'Law', 'Finance'];
  caseTypes = ['Civil', 'Criminal', 'Writ'];
  statuses = ['Dispatched', 'Pending'];
  docDate: string = '';
  dispatchVisible = false;
selectedCases: any[] = [];
agcino: string = '';


  // user_code: string = '154';
  user_code: string = ''; 
  // user_code: string = '688'; 

  // Pagination
  page = 1;
  pageSize = 10;

  constructor(private fb: FormBuilder, private ds: DataService, private iconService: NzIconService) {
     this.iconService.addIcon(FilePdfTwoTone);
   }

  ngOnInit(): void {
    this.initializeSession();
    // this.getDispatchCases();
    // this.getConcernData();

    this.filterForm = this.fb.group({
      caseNo: [''],
      petitioner: [''],
      respondent: [''],
      department: [''],
      caseType: [''],
      dispatchFrom: [''],
      dispatchTo: [''],
      status: ['']
    });
  }

  private initializeSession(): void {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.user_code = res.user_code;
        this.getDispatchCases();
      },
      error: (err) => {
        console.error('Error fetching session:', err);
      }
    });
  }
  toggleCaseSelection(caseItem: any, event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked;

  if (isChecked) {
    this.selectedCases.push(caseItem);
  } else {
    this.selectedCases = this.selectedCases.filter(c => c !== caseItem);
  }

  this.dispatchVisible = this.selectedCases.length > 0;
}


getConcernData(agcino: string){
  this.ds.getData('concern_detail', { params: { agcino } }).subscribe({
    next: (res: any) => {
      console.log('Concern data fetched successfully:', res);
      // Process the concern data as needed

        this.concernData = res.data.map((item: any, i: number) => ({
        conname: item.conname,
        RespondentName: item.RespondentName,
         
        }));
    },
    error: (err) => {
      console.error('Error fetching concern data:', err);
    }
  });
}

getDispatchCases(): void {
    this.ds.getData('dispatch_case', { params: { user_code: this.user_code } }).subscribe({
      next: (res: any) => {
        console.log('Dispatch cases fetched successfully:', res);

        this.dispatchCases = res.data.map((item: any, i: number) => ({
          caseNo: item.agcino,
          petitioner: item.pet_name,
          respondent: item.res_name,
          law_officer: item.law_officer,
          date_of_receiving:item.date_of_receiving,
          date_of_due: item.date_of_due,
          file_nm: item.file_nm,
         
        }));

        this.docDate = res.docDate;
        this.filteredCases = [...this.dispatchCases];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error fetching dispatch cases:', err);
      }
    });
  }
getFileUrl(fileName: string): string {
  return `http://your-backend-url/uploads/${fileName}`; // Replace with your actual backend URL
}


  applyFilters(): void {
    const {
      caseNo,
      petitioner,
      respondent,
      department,
      caseType,
      dispatchFrom,
      dispatchTo,
      status
    } = this.filterForm.value;

    this.filteredCases = this.dispatchCases.filter(item => {
      return (
        (!caseNo || item.caseNo?.includes(caseNo)) &&
        (!petitioner || item.petitioner?.toLowerCase().includes(petitioner.toLowerCase())) &&
        (!respondent || item.respondent?.toLowerCase().includes(respondent.toLowerCase())) &&
        (!department || item.department === department) &&
        (!caseType || item.caseType === caseType) &&
        (!status || item.status === status) &&
        (!dispatchFrom || item.dispatchDate >= dispatchFrom) &&
        (!dispatchTo || item.dispatchDate <= dispatchTo)
      );
    });

    this.page = 1;
  }

  get paginatedCases() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredCases.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.page * this.pageSize < this.filteredCases.length) this.page++;
  }

  prevPage(): void {
    if (this.page > 1) this.page--;
  }
}
