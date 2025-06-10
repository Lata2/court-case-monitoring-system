import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { DataService } from '../../../../services/data.service';
import { EncryptionService } from '../../../../services/encryption.service';

interface FormData {
  [key: string]: any; // fallback for dynamic use with fieldMapping
  regno?: string;
  cnrno?: string;
  petitionername?: string;
  petitioneradvocatename?: string;
  respondentname?: string;
  respondentadvocatename?: string;
  courtname?: string;
  nexthearingdate?: string;
  action?: string;
  office?: string;
  compliance?: string;
  activity?: string;
  copyto?: string;
  duedate?: string;
  remarks?: string;
  doctype?: string;
  docnumber?: string;
  upload?: File;
  docdate?: string;
}

@Component({
  selector: 'app-allotement-allocate-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './allotement-allocate-details.component.html',
  styleUrls: ['./allotement-allocate-details.component.css']
})
export class AllotementAllocateDetailsComponent implements OnInit {

  selectedAction: string = 'not_preparing';
  cnrNo: string = '';
  dept_id: string = '';
  user_code: string = '';
  role_id: string | null = null;
  dist_code: string | null = null;

fieldMapping: { [key: string]: string } = {
  regno: 'RegNo',
  cnrno: 'cino',
  petitionername: 'pet_name',
  petitioneradvocatename: 'pet_adv',
  respondentname: 'res_name',
  respondentadvocatename: 'res_adv',
  courtname: 'court_est_name',
  nexthearingdate: 'NextHearingDate'
};



  
  formData: FormData = {};
  uploadDocuments: any[] = [];

  private route = inject(ActivatedRoute);
  private encryptionService = inject(EncryptionService);

  constructor(private ds: DataService) {}

  ngOnInit(): void {
    this.initializeSession();
    this.decryptCnr();
  }

  private decryptCnr(): void {
    const encryptedCnr = this.route.snapshot.paramMap.get('cnrNo');
    if (encryptedCnr) {
      try {
        const decrypted = this.encryptionService.decrypt(decodeURIComponent(encryptedCnr));
        this.cnrNo = decrypted;
        this.formData['cnrno'] = decrypted;
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
        this.dist_code = res.dist_code;
        this.getFormData();
        this.getTableData();
      },
      error: (err) => {
        console.error('Error fetching session:', err);
      }
    });
  }

  onActionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedAction = target.value;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formData['upload'] = file;
    }
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      const fd = new FormData();
      Object.keys(this.formData).forEach(key => {
        fd.append(key, this.formData[key]);
      });

      this.ds.postData('dashboardAllocatedDetails', fd).subscribe({
        next: (res) => {
          console.log('Form submitted successfully:', res);
          this.getTableData();
        },
        error: (err) => {
          console.error('Form submission error:', err);
        }
      });
    } else {
      console.warn('Form is invalid');
    }
  }



// In getFormData(), assign values using the correct formData keys
getFormData(): void {
  const params = new HttpParams()
    .set('dept_id', this.dept_id)
    .set('user_code', this.user_code)
    .set('cino', this.cnrNo)
    .set('role_id', this.role_id || '')
    .set('dist_code', this.dist_code || '');

  this.ds.getData('getLists', { params }).subscribe({
    next: (res) => {
      // Clear existing values
      this.formData = {};

      // Extract first item from allocatDetails array
      const allocate = res.allocatDetails?.[0] || {};

      // Map backend response to formData
      Object.entries(this.fieldMapping).forEach(([formKey, backendKey]) => {
        if (allocate[backendKey]) {
          if (formKey === 'nexthearingdate') {
            // Convert DD-MM-YYYY to YYYY-MM-DD
            const [day, month, year] = allocate[backendKey].split('-');
            this.formData[formKey] = `${year}-${month}-${day}`;
          } else {
            this.formData[formKey] = allocate[backendKey];
          }
        }
      });
      
      // Verify populated data
      console.log('Form Data:', this.formData);
    },
    error: (err) => {
      console.error('Error fetching data:', err);
    }
  });
}

  getTableData(): void {
  const params = new HttpParams()
    .set('dept_id', this.dept_id)
    .set('user_code', this.user_code)
    .set('cino', this.cnrNo);

  this.ds.getData('getDocu', { params }).subscribe({
    next: (res) => {
      // Ensure we always have an array
      this.uploadDocuments = Array.isArray(res) ? res : [];
      console.log('Upload Documents:', this.uploadDocuments);
    },
    error: (err) => {
      console.error('Error fetching documents:', err);
      this.uploadDocuments = [];
    }
  });
}

  viewFile(doc: any): void {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      alert('Document URL not available.');
    }
  }

}