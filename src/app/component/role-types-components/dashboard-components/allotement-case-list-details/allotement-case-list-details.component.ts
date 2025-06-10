import { Component, inject, OnInit } from '@angular/core';
import { SerchComponentComponent } from '../serch-component/serch-component.component';
import { CommonModule } from '@angular/common'; 
import { Router, ActivatedRoute } from '@angular/router';
import { EncryptionService } from '../../../../services/encryption.service';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-allotement-case-list-details',
  standalone: true,
  imports: [SerchComponentComponent, CommonModule],
  templateUrl: './allotement-case-list-details.component.html',
  styleUrl: './allotement-case-list-details.component.css'
})
export class AllotementCaseListDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private encryptionService = inject(EncryptionService);

  allotmentList: any[] = [];
  filteredList: any[] = [];
  totalRecords: number = 0;
  dept_id: string = '';
  user_code: string = '';
  queryType: string = '';

  // ✅ Pagination-related properties
  pageSize: number = 10;
  pageNo: number = 1;

  constructor(private ds: DataService) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const encryptedQuery = params.get('queryType');
      if (encryptedQuery) {
        try {
          const decoded = decodeURIComponent(encryptedQuery);
          this.queryType = this.encryptionService.decrypt(decoded);
          console.log('Decrypted queryType:', this.queryType);
        } catch (err) {
          console.error('Error decrypting queryType:', err);
        }
      }

      this.initializeSession();
    });
  }

  private initializeSession(): void {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.dept_id = res.dept_id;
        this.user_code = res.user_code;

        this.getAllotmentList();
      },
      error: (err) => {
        console.error('Error fetching session:', err);
      }
    });
  }

  navigatePerticularCaseDetails() {
    this.router.navigate(['header', 'perticular-case-datail']);
  }

  navigateToAllocate(caseData: any): void {
    const encrypted = encodeURIComponent(this.encryptionService.encrypt(caseData.CNRNo));
    this.router.navigate(['/header/allotement_allocate_details', encrypted]);
  }

  getAllotmentList() {
    this.ds.getData('getTableDetails', {
      params: {
        dept_id: this.dept_id,
        user_code: this.user_code,
        queryType: this.queryType
      },
    }).subscribe(
      (res) => {
        this.allotmentList = Array.isArray(res) ? res : (res.data || []);
        this.totalRecords = this.allotmentList.length;

        if (this.queryType) {
          this.allotmentList = this.allotmentList.filter(item =>
            item.queryType === this.queryType
          );
        }

        this.updatePagination();
      },
      (error) => {
        console.error('Error fetching allotment list:', error);
      }
    );
  }

  // ✅ Handles page size change
  onPageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.pageSize = +value;
    this.pageNo = 1;
    this.updatePagination();
  }

  // ✅ Updates paginated data
  updatePagination(): void {
    const startIndex = (this.pageNo - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredList = this.allotmentList.slice(startIndex, endIndex);
  }

  // ✅ Navigate pages (example use in template)
  goToPage(page: number): void {
    this.pageNo = page;
    this.updatePagination();
  }
}
