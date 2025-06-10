import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataService } from '../../../../../services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-doc-caseno',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  templateUrl: './upload-doc-caseno.component.html',
  styleUrls: ['./upload-doc-caseno.component.css','../../../dashboard-components/action/add-new-cases/add-new-cases.component.css']
})
export class UploadDocCasenoComponent implements OnInit {
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
  allDocs: any[] = [];

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
          // Swal.fire('Success', 'Case details loaded successfully!', 'success');
        } else {
          this.caseList = [];
          this.caseDocList = [];
          this.cino = '';
          this.filePreviewUrl = null;
          Swal.fire('No Data', 'No case found with the provided details.', 'info');
        }
      },
      error => {
        console.error('Search error:', error);
        Swal.fire('Error', 'Failed to fetch case details.', 'error');
      }
    );
  }

  getUploadedDocuments(cino: string) {
    const params = new HttpParams().set('cino', cino);
    this.ds.getData('case_documents', { params }).subscribe(
      data => { this.caseDocList = data; },
      err => console.error('Error fetching docs:', err)
    );
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        Swal.fire('Invalid File', 'Only PDF files are allowed.', 'warning');
        this.uploadForm.patchValue({ upload_file: null });
        return;
      }
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
    if (this.uploadForm.invalid || !this.selectedFile || this.caseList.length === 0) {
      this.uploadForm.markAllAsTouched();
      Swal.fire('Error', 'Please complete the form and ensure a case is selected.', 'warning');
      return;
    }

    this.isUploading = true;
    const docu_id = this.uploadForm.value.docu_id;
    const selectedDoc = this.caseDocName.find(doc => doc.docu_id === docu_id);
    const docu_name = selectedDoc?.docu_name || '';
    const commonFormValues = {
      document_no: this.uploadForm.value.document_no,
      document_date: this.uploadForm.value.document_date,
      remarks: this.uploadForm.value.remarks || '',
      docu_id,
      docu_name
    };

    let uploadCount = 0;
    let errorCount = 0;

    this.caseList.forEach((caseItem) => {
      const formData = new FormData();
      formData.append('document', this.selectedFile!);
      formData.append('cino', caseItem.cino);
      formData.append('dept_id', caseItem.dept_id);
      formData.append('user_code', this.user_code);
      formData.append('docu_id', commonFormValues.docu_id);
      formData.append('docu_name', commonFormValues.docu_name);
      formData.append('document_no', commonFormValues.document_no);
      formData.append('document_date', commonFormValues.document_date);
      formData.append('remarks', commonFormValues.remarks);

      this.ds.postData('upload_document', formData, { withCredentials: true }).subscribe({
        next: () => uploadCount++,
        error: () => errorCount++,
        complete: () => {
          if (uploadCount + errorCount === this.caseList.length) {
            this.isUploading = false;
            if (errorCount > 0) {
              Swal.fire('Partial Success', `${errorCount} uploads failed.`, 'warning');
            } else {
              // Swal.fire('Uploaded', 'All documents uploaded successfully!', 'success');
            }
            this.getUploadedDocuments(this.caseList[0].cino);
            this.getDocuDetails();
            this.uploadForm.patchValue({ docu_id: '', document_no: '', document_date: '', remarks: '', upload_file: null });
            this.uploadForm.get('upload_file')?.updateValueAndValidity();
            this.selectedFile = null;
            if (this.previewUrlRaw) URL.revokeObjectURL(this.previewUrlRaw);
            this.previewUrlRaw = null; this.filePreviewUrl = null;
          }
        }
      });
    });
  }

  onView(doc: any) {
    const fileUrl = `/uploads/${doc.filename}`;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    window.open(fileUrl, '_blank');
  }

  getDocuDetails() {
    this.allDocs = [];
    if (!this.caseList.length) {
      Swal.fire('Info', 'No cases available to fetch document details.', 'info');
      return;
    }
    let pending = this.caseList.length;
    this.caseList.forEach(caseItem => {
      const params = new HttpParams().set('dept_id', caseItem.dept_id).set('cino', caseItem.cino);
      this.ds.getData('documents', { params }).subscribe({
        next: (res: any) => {
          const docs = Array.isArray(res.document) ? res.document : [res.document];
          this.allDocs.push(...docs);
        },
        error: err => console.error(err),
        complete: () => {
          pending--;
          if (pending === 0) {
            const map = new Map<string, any>();
            this.allDocs.forEach(d => {
              const curDate = new Date(d.document_date);
              const ex = map.get(d.docu_name);
              const exDate = ex ? new Date(ex.document_date) : null;
              if (!ex || (exDate && curDate > exDate)) map.set(d.docu_name, d);
            });
            this.caseDocList = Array.from(map.values());
          }
        }
      });
    });
  }

  onDelete(doc: any) {
    Swal.fire({
      title: 'Confirm Deletion', text: 'Delete this document?', icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Yes, delete!'
    }).then(res => {
      if (res.isConfirmed) {
        const related = this.allDocs.filter(d => d.docu_name === doc.docu_name);
        let del=0, err=0;
        related.forEach(docToDelete => {
          this.ds.postData('delete_document', { docId: docToDelete.docId, user_code: this.user_code }, { withCredentials: true }).subscribe({
            next: () => del++,
            error:()=> err++,
            complete: ()=>{
              if (del+err===related.length) {
                if (err>0) Swal.fire('Partial', `${err} deletions failed.`, 'warning');
                else Swal.fire('Deleted', 'Document deleted.', 'success');
                this.caseDocList=this.caseDocList.filter(d=>d.docu_name!==doc.docu_name);
                this.allDocs=this.allDocs.filter(d=>d.docu_name!==doc.docu_name);
              }
            }
          });
        });
      }
    });
  }

  viewPdf() {
    if (this.previewUrlRaw) window.open(this.previewUrlRaw, '_blank');
    else Swal.fire('Info', 'No PDF available for preview.', 'info');
  }
}
