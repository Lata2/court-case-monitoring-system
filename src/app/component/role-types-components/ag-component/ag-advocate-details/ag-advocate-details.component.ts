import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ag-advocate-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ag-advocate-details.component.html',
  styleUrls: ['./ag-advocate-details.component.css']
})
export class AgAdvocateDetailsComponent implements OnInit {
  formModel = {
    adv_name: '',
    adv_reg: '',
    email: '',
    adv_mobile: ''
  };

  user_code = '';
  advocates: any[] = [];
  filteredAdvocates: any[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  searchTerm = '';

  isEditing = false;
  adv_code: number | null = null;

  constructor(private ds: DataService) {}

  ngOnInit() {
    this.initializeSession();
    this.getAdvocates();
  }

  private initializeSession() {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => this.user_code = res.user_code,
      error: err => console.error('Error fetching session:', err)
    });
  }

  getAdvocates(page: number = 1) {
    const params = {
      page: page.toString(),
      pageSize: this.pageSize.toString()
    };

    this.ds.getData('lawofficers', params).subscribe({
      next: (res: any) => {
        this.advocates = res.data;
        this.filteredAdvocates = [...this.advocates];
        this.currentPage = res.pagination.page;
        this.totalPages = res.pagination.totalPages;
      },
      error: err => console.error('Error fetching advocates', err)
    });
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.getAdvocates();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getAdvocates(page);
  }

  onSearch() {
    const trimmedSearch = this.searchTerm.trim();
    if (!trimmedSearch) {
      this.getAdvocates();
      return;
    }

    const params = {
      txtSearch: trimmedSearch,
      user_code: this.user_code,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.ds.getData('ag-adv-details-search', { params }).subscribe({
      next: (res: any) => {
        this.filteredAdvocates = res.data || [];
        this.totalPages = Math.ceil(this.filteredAdvocates.length / this.pageSize);
        this.currentPage = 1;
      },
      error: err => {
        console.error('Search error', err);
        this.filterClientSide();
      }
    });
  }

  private filterClientSide() {
    const term = this.searchTerm.toLowerCase();
    this.filteredAdvocates = this.advocates.filter(adv =>
      adv.adv_name?.toLowerCase().includes(term) ||
      adv.adv_reg?.toLowerCase().includes(term) ||
      adv.email?.toLowerCase().includes(term) ||
      adv.adv_mobile?.includes(term)
    );
    this.totalPages = Math.ceil(this.filteredAdvocates.length / this.pageSize);
  }

  submitForm() {
    if (!this.formModel.adv_name.trim() || !this.formModel.adv_reg.trim()) {
      Swal.fire('Validation Error', 'Name and Registration are required.', 'warning');
      return;
    }
    this.isEditing && this.adv_code != null ? this.updateAdvocate() : this.addAdvocate();
  }

  private addAdvocate() {
    this.ds.postData('lawofficers', this.formModel).subscribe({
      next: () => {
        Swal.fire('Success', 'Advocate added successfully!', 'success');
        this.getAdvocates();
        this.resetForm();
      },
      error: err => {
        console.error('Error adding advocate', err);
        Swal.fire('Error', 'Failed to add advocate.', 'error');
      }
    });
  }

  private updateAdvocate() {
    if (this.adv_code == null) return;

    this.ds.putData('lawofficers', this.adv_code, this.formModel).subscribe({
      next: () => {
        Swal.fire('Updated', 'Advocate updated successfully!', 'success');
        this.getAdvocates();
        this.resetForm();
      },
      error: err => {
        console.error('Error updating advocate', err);
        Swal.fire('Error', 'Failed to update advocate.', 'error');
      }
    });
  }

  editAdvocate(adv: any) {
    this.isEditing = true;
    this.adv_code = adv.adv_code;
    this.formModel = {
      adv_name: adv.adv_name,
      adv_reg: adv.adv_reg,
      email: adv.email,
      adv_mobile: adv.adv_mobile
    };
  }

  resetForm() {
    this.isEditing = false;
    this.adv_code = null;
    this.formModel = {
      adv_name: '',
      adv_reg: '',
      email: '',
      adv_mobile: ''
    };
  }

  restrictInput(event: KeyboardEvent) {
    const allowedKeys = /^[0-9\b]+$/;
    if (!allowedKeys.test(event.key)) {
      event.preventDefault();
    }
  }

  limitDigits(event: any) {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length > 10) {
      event.target.value = value.slice(0, 10);
      this.formModel.adv_mobile = value.slice(0, 10);
    } else {
      this.formModel.adv_mobile = value;
    }
  }
}
