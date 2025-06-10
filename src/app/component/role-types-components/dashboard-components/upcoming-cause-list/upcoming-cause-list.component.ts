import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../../services/data.service';
import { EncryptionService } from '../../../../services/encryption.service';
import { LoadingService } from '../../../../services/loading.service';

interface AllotmentResponse {
  data: any[];
  total: number;
}

@Component({
  selector: 'app-upcoming-cause-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upcoming-cause-list.component.html',
  styleUrls: ['./upcoming-cause-list.component.css']
})
export class UpcomingCauseListComponent {
  allotmentList: AllotmentResponse = { data: [], total: 0 };
  totalRecords: number = 0;
  cino: string = '';
  dept_id: string = '';
  user_code: string = '';
  role_id: string = '';
  take: string = '10';
  skip: number = 0;
  currentPage: number = 1;
  date: string = '';
  flag: string = 'A';
  dataLoaded: boolean = false; // ✅ Flag to track if data is loaded

  private route = inject(ActivatedRoute);
  private encryptionService = inject(EncryptionService);
  private router = inject(Router);

  constructor(
    private ds: DataService,
    public loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.decryptDate();
  }

  private decryptDate(): void {
    const encryptedDate = this.route.snapshot.paramMap.get('date');
    if (encryptedDate) {
      try {
        const decoded = decodeURIComponent(encryptedDate);
        const decrypted = atob(decoded);
        this.date = decrypted;
        if (this.date?.trim()) {
          this.initializeSession();
        }
      } catch (e) {
        console.error('Decryption failed:', e);
      }
    }
  }

  private initializeSession(): void {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.role_id = res.role_id;
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
    if (this.cino) {
      const encrypted = this.encryptionService.encrypt(this.cino);
      const encoded = encodeURIComponent(encrypted);
      this.router.navigate(['header', 'perticular-case-datail', encoded]);
    } else {
      console.warn('CINO is empty');
    }
  }

  getAllotmentList(): void {
    this.loadingService.show();
    this.dataLoaded = false;

    this.skip = (this.currentPage - 1) * parseInt(this.take, 10);

    const params = new HttpParams()
      .set('dept_id', this.dept_id)
      .set('user_code', this.user_code)
      .set('date', this.date)
      .set('take', this.take)
      .set('skip', this.skip.toString())
      .set('role_id', this.role_id)
      .set('flag', this.flag);
      // console.log(params);
      

    this.ds.getData('cause-list1', { params }).subscribe({
      next: (data) => {
        this.loadingService.hide();
        this.dataLoaded = true;

        if (data && Array.isArray(data.data)) {
          this.allotmentList = data;
          this.cino = data.data[0]?.CNRNo || '';
          this.totalRecords = data.total || 0;
        } else {
          this.allotmentList = { data: [], total: 0 };
          this.totalRecords = 0;
        }
      },
      error: (error) => {
        this.loadingService.hide();
        this.dataLoaded = true;
        console.error('Error fetching allotment list:', error);
        this.allotmentList = { data: [], total: 0 };
        this.totalRecords = 0;
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.getAllotmentList();
  }

  totalPages(): number {
    return Math.ceil(this.totalRecords / parseInt(this.take, 10));
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.getAllotmentList();
  }
}
