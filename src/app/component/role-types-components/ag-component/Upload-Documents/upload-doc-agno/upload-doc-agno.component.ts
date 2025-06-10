import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataService } from '../../../../../services/data.service';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-upload-doc-agno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  templateUrl: './upload-doc-agno.component.html',
  styleUrls: ['./upload-doc-agno.component.css']
})
export class UploadDocAgnoComponent implements OnInit {
  agcino = '';
  caseData: any = null;
  showUploadForm = false;
  showModal = false;
  selectedFile: File | null = null;
  remarks = '';
  docType = '';
  documents: any[] = [];
  searchDone = false;
  docTypes: any[] = [];
  user_code = '';
  respondentList: any[] = [];
  showDocuments = false;
  isUploading = false;
  previewUrlRaw = '';
  filePreviewUrl: SafeResourceUrl | null = null;
  previewFileType: 'image' | 'pdf' | null = null;

  // Validation flags
  fileTouched = false;
  docTouched = false;

  selectedDocumentUrl: string | null = null;
  showPreview: boolean = false;

  constructor(
    private ds: DataService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.initializeSession();
    this.getDocumentTypes();
  }

  private initializeSession() {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => (this.user_code = res.user_code),
      error: err => console.error('Error fetching session:', err)
    });
  }

  getDocumentTypes() {
    this.ds.getData('doc_types').subscribe(data => {
      this.docTypes = data;
    });
  }

  onSearch() {
    this.caseData = null;
    this.searchDone = false;
    this.showDocuments = false;
    this.showPreview = false;

    if (!this.agcino) return;

    this.ds.getData('ag_docu_search', {
      params: { agcino: this.agcino }
    }).subscribe({
      next: (data: any) => {
        this.caseData = data;
        this.searchDone = true;
        this.getRespondentList();
        // this.getAllDocumentsList();
      },
      error: () => {
        this.caseData = null;
        this.searchDone = true;
      }
    });
  }

  onFileSelected(event: any) {
    this.fileTouched = true;
    const file = event.target.files[0];
    if (file) {
      if (this.previewUrlRaw) URL.revokeObjectURL(this.previewUrlRaw);
      this.selectedFile = file;
      const blobUrl = URL.createObjectURL(file);
      this.previewUrlRaw = blobUrl;
      this.filePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      this.previewFileType = file.type.includes('pdf') ? 'pdf' : 'image';
    }
  }

  viewPdf() {
    if (this.previewUrlRaw) window.open(this.previewUrlRaw, '_blank');
    else Swal.fire('No file selected for preview');
  }

  openModal() {
    this.showModal = true;
  }

  uploadDocument() {
    this.fileTouched = true;
    this.docTouched = true;

    if (!this.selectedFile || !this.agcino || !this.docType) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing data',
        text: 'Please select document type and file.'
      });
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    formData.append('document', this.selectedFile);
    formData.append('agcino', this.agcino);
    formData.append('docu_id', this.docType);
    formData.append('docu_name', this.getDocName(this.docType));
    formData.append('remarks', this.remarks);
    formData.append('user_code', this.user_code);

    this.ds.postData('ag_upload_document', formData).subscribe({
      next: (response: any) => {
        this.isUploading = false;
        this.showUploadForm = false;
        this.showDocuments = true;
        this.getAllDocumentsList();
        this.resetUploadForm();

        Swal.fire({
          icon: 'success',
          title: 'Uploaded!',
          showCloseButton: true,
          showCancelButton: true,
          cancelButtonText: 'Close',
        });
      },
      error: () => {
        this.isUploading = false;
        Swal.fire({
          icon: 'error',
          title: 'Upload failed',
          text: 'Please try again later.'
        });
      }
    });
  }

  getDocName(docType: string) {
    const doc = this.docTypes.find(d => d.docu_id === docType);
    return doc ? doc.docu_name : '';
  }

  getAllDocumentsList() {
    this.ds.getData('ag_all_documents', { params: { agcino: this.agcino } })
      .subscribe((res: any) => {
        this.documents = res.documents || [];
        this.showDocuments = this.documents.length > 0;
      });
  }

  getRespondentList() {
    this.ds.getData('respondent_list', { params: { agcino: this.agcino } })
      .subscribe((res: any) => (this.respondentList = res));
  }

  deleteDocument(doc: any) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then(result => {
      if (result.isConfirmed) {
        this.ds.postData('ag_delete_document', {
          docId: doc.docId,
          agcino: this.agcino
        }).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Document has been deleted.',
            timer: 1500,
            showConfirmButton: false
          });
          this.getAllDocumentsList();
        });
      }
    });
  }

  resetUploadForm() {
    this.selectedFile = null;
    this.docType = '';
    this.remarks = '';
    this.previewUrlRaw = '';
    this.previewFileType = null;
    this.filePreviewUrl = null;
    this.fileTouched = false;
    this.docTouched = false;
  }

  viewDocu(doc: any) {
    this.selectedDocumentUrl = doc.url;
    this.filePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.url);
    this.previewFileType = doc.url.endsWith('.pdf') ? 'pdf' : 'image';
    this.showPreview = true;

    // Open the document URL in a new tab
    window.open(doc.url, '_blank');
  }
}
