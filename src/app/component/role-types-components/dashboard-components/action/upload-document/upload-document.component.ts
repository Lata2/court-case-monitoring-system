import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataService } from '../../../../../services/data.service';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.css', '../add-new-cases/add-new-cases.component.css']
})
export class UploadDocumentComponent implements OnInit {
  uploadForm!: FormGroup;
  caseNatures: any[] = [];
  years: any[] = [];
  caseDocName: any[] = [];
  caseList: any[] = [];
  caseDocList: any[] = [];
  selectedFile: File | null = null;
  isSearchClicked: boolean = false;
  cino: string = '';
  pdfUrl: SafeResourceUrl | null = null;
  previewUrlRaw: string | null = null;
  user_code: string = '';
  dept_id: string = '';
  role_id: string = '';
  filePreviewUrl: SafeResourceUrl | null = null;
  isUploading: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private ds: DataService
  ) {}

  ngOnInit(): void {
    this.initializeSession();

    this.uploadForm = this.fb.group({
      case_type: ['', Validators.required],
      case_no: ['', [Validators.required, Validators.pattern(/^[1-9]\d{0,4}$/)]],
      case_year: ['', Validators.required],
      docu_id: ['', Validators.required],
      document_no: ['', Validators.required],
      document_date: ['', Validators.required],
      remarks: [''],
      upload_file: [null, Validators.required]
    });

    this.getYears();
    this.getDocumentTypes();
    this.getCaseNatures();
  }

  get caseNoControl() {
    return this.uploadForm.get('case_no');
  }

  private initializeSession(): void {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.user_code = res.user_code;
        this.dept_id = res.dept_id;
        this.role_id = res.role_id;
      }
    });
  }

  getYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 30 }, (_, i) => ({ year: currentYear - i }));
  }

  getDocumentTypes() {
    this.ds.getData('doc_types').subscribe(data => {
      this.caseDocName = data;
    });
  }

  getCaseNatures() {
    this.ds.getData('add_case/case_natures').subscribe(data => {
      this.caseNatures = data;
    });
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    if (!/^[0-9]$/.test(event.key)) event.preventDefault();
  }

  onReset() {
    this.uploadForm.reset();
    this.caseList = [];
    this.caseDocList = [];
    this.isSearchClicked = false;
    this.selectedFile = null;
    if (this.previewUrlRaw) {
      URL.revokeObjectURL(this.previewUrlRaw);
    }
    this.previewUrlRaw = null;
    this.filePreviewUrl = null;
  }

  onSearchSubmit() {
    const { case_type, case_no, case_year } = this.uploadForm.value;
    const params = new HttpParams()
      .set('case_type', case_type)
      .set('case_no', case_no)
      .set('case_year', case_year)
      .set('dept_id', this.dept_id)
      .set('role_id', this.role_id);

    this.ds.getData('up_doc_search', { params }).subscribe(
      data => {
        this.isSearchClicked = true;
        if (data?.length > 0) {
          this.caseList = data;
          this.cino = data[0].cino;
          this.getUploadedDocuments(this.cino);
        } else {
          this.caseList = [];
          this.caseDocList = [];
          alert('No case found with the provided details.');
        }
      },
      error => {
        console.error('Search error:', error);
      }
    );
  }

  getUploadedDocuments(cino: string) {
    const params = new HttpParams().set('cino', cino);
    this.ds.getData('case_documents', { params }).subscribe(data => {
      this.caseDocList = data;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (this.previewUrlRaw) {
        URL.revokeObjectURL(this.previewUrlRaw);
      }
      this.selectedFile = file;
      const url = URL.createObjectURL(file);
      this.previewUrlRaw = url;
      this.filePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

      this.uploadForm.patchValue({ upload_file: file });
      this.uploadForm.get('upload_file')?.updateValueAndValidity();
    }
  }

  onUploadSubmit() {
    if (this.uploadForm.invalid || !this.selectedFile || !this.cino) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    this.isUploading = true;

    const docu_id = this.uploadForm.value.docu_id;
    const selectedDoc = this.caseDocName.find(doc => doc.docu_id === docu_id);
    const docu_name = selectedDoc?.docu_name || '';

    const formData = new FormData();
    formData.append('document', this.selectedFile);
    formData.append('cino', this.cino);
    formData.append('docu_id', docu_id);
    formData.append('document_no', this.uploadForm.value.document_no);
    formData.append('document_date', this.uploadForm.value.document_date);
    formData.append('remarks', this.uploadForm.value.remarks || '');
    formData.append('user_code', this.user_code);
    formData.append('dept_id', this.dept_id);
    formData.append('docu_name', docu_name);

    this.ds.postData('upload_document', formData, { withCredentials: true })
      .subscribe({
        next: () => {
          this.getUploadedDocuments(this.cino);
          this.uploadForm.patchValue({
            docu_id: '',
            document_no: '',
            document_date: '',
            docu_name: '',
            remarks: '',
            upload_file: null
          });

          this.uploadForm.get('upload_file')?.updateValueAndValidity();
          this.selectedFile = null;
          if (this.previewUrlRaw) {
            URL.revokeObjectURL(this.previewUrlRaw);
          }
          this.previewUrlRaw = null;
          this.filePreviewUrl = null;
          this.getDocuDetails();
        },
        error: (error) => {
          console.error('Upload error:', error);
          alert('Failed to upload document.');
        },
        complete: () => {
          this.isUploading = false;
        }
      });
  }

  onView(doc: any) {
    const fileUrl = `/uploads/${doc.filename}`;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    window.open(fileUrl, '_blank');
  }

  getDocuDetails() {
    const params = new HttpParams()
      .set('dept_id', this.dept_id)
      .set('cino', this.cino);
    this.ds.getData('documents', { params }).subscribe({
      next: (response: any) => {
        this.caseDocList = Array.isArray(response.document)
          ? response.document
          : [response.document];
      },
      error: (error: any) => {
        console.log('Error fetching documents', error);
      }
    });
  }

  onDelete(doc: any) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    const payload = {
      docId: doc.docId,
      user_code: this.user_code
    };

    this.ds.postData('delete_document', payload, { withCredentials: true }).subscribe({
      next: (res: any) => {
        alert(res.message || 'Document deleted successfully.');
        this.caseDocList = this.caseDocList.filter(d => d.docu_uploads_id !== doc.docu_uploads_id);
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to delete document.');
        console.error('Delete error:', err);
      }
    });
  }

  viewPdf() {
    if (this.previewUrlRaw) {
      window.open(this.previewUrlRaw, '_blank');
    } else {
      alert('No PDF available for preview.');
    }
  }
}
