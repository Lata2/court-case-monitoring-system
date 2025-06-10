import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { DataService } from '../../../../services/data.service';
import { EncryptionService } from '../../../../services/encryption.service';

@Component({
  selector: 'app-perticular-case-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perticular-case-detail.component.html',
  styleUrls: ['./perticular-case-detail.component.css']
})
export class PerticularCaseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private encryptionService = inject(EncryptionService);

  decryptedCino: string = '';
  CaseDetails: any = {};
  RespondentName: string = '';
  PetitionerName: string = '';
  PetitionerAdvocateName: string = '';
  RespondentAdvocateName: string = '';
  CategoryDetails: any = {};
  CaseHearingHistory: any[] = [];
  DocumentDetails: any[] = [];
  Orders: any[] = [];
  IADetails: any[] = [];
  ProcessedObjections: any[] = [];
  dept_id: string = '';

  constructor(private ds: DataService) {}

  ngOnInit() {
    this.initializeSession();
  }

  private initializeSession(): void {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.dept_id = res.dept_id;
        this.decryptCinoAndFetchCase(); // call here after dept_id is ready
      }
    });
  }

  decryptCinoAndFetchCase() {
    const encryptedCino = this.route.snapshot.paramMap.get('cino');
    if (encryptedCino) {
      try {
        const decoded = decodeURIComponent(encryptedCino);
        this.decryptedCino = this.encryptionService.decrypt(decoded);
        this.getPerticularCase(this.decryptedCino);
      } catch (error) {
        console.error('Error decrypting CINO:', error);
      }
    }
  }

  getPerticularCase(cino: string) {
    const params = new HttpParams()
      .set('cino', cino)
      .set('dept_id', this.dept_id);

    this.ds.getData('particular-case', { params }).subscribe({
      next: (data) => {
        console.log('Case Data:', data);

        this.CaseDetails = {
          CNR: data.CNR,
          FilingNo: data.FilingNo,
          FilingDate: data.FilingDate,
          RegistrationNo: data.RegistrationNo,
          DateofRegistration: data.DateofRegistration,
          FirstHearingDate: data.FirstHearingDate,
          lastHearingDate: data.lastHearingDate,
          coram: data.coram,
          StageofCase: data.StageofCase,
          BenchType: data.BenchType,
          JudicialBranch: data.JudicialBranch,
          CauselistType: data.CauselistType,
          PetitionerName: data.PetitionerName,
          PetitionerNameDetails: data.PetitionerNameDetails,
          RespondentName: data.RespondentName,
          RespondentNameDetails: data.RespondentNameDetails,
          currentlywith: data.currentlywith
        };

        this.PetitionerAdvocateName = data.PetitionerAdvocateName || '';
        this.RespondentAdvocateName = data.RespondentAdvocateName || '';
        this.PetitionerName = data.PetitionerName || '';
        this.RespondentName = data.RespondentName || '';
        this.CategoryDetails = data.CategoryDetails || {};

        // Convert object to array for *ngFor
        this.CaseHearingHistory = Object.values(data.CaseHearingHistory || {});
        this.DocumentDetails = data.DocumentDetails || [];
        this.Orders = data.Orders || [];

        // ✅ Clean ia_number from HTML tags
       this.IADetails = Object.values(data.IADetails || {}).map((item: any) => ({
          ...item,
          ia_number: (item.ia_number || '')
            .replace(/<[^>]+>/g, '')                // Remove HTML tags
            .replace(/Classification\s*:/gi, '')   // Remove "Classification :"
            .trim()
        }));

        // ProcessedObjections is already an array
        this.ProcessedObjections = data.ProcessedObjections || [];
      },
      error: (error) => {
        console.error('API error:', error);
      }
    });
  }
}
