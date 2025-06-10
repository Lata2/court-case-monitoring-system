import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { EncryptionService } from '../../../../../services/encryption.service';
import { DataService } from '../../../../../services/data.service';

@Component({
  selector: 'app-allotment',
  standalone: true,
  templateUrl: './allotment.component.html',
  styleUrls: ['./allotment.component.css']
})
export class AllotmentComponent implements OnInit {
  directCases: number = 0;
  selfExamine: number = 0;
  directorate: number = 0;
  returnCase: number = 0;

  dept_id: string = '';
  user_code: string = '';
  role_id: string = "";

  constructor(
    private router: Router,
    private ds: DataService,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit() {
    this.initializeSession();
  }

  navigateWithQueryType(queryType: string | number) {
  const encryptedQueryType = this.encryptionService.encrypt(queryType.toString());
  const encodedQueryType = encodeURIComponent(encryptedQueryType);

  this.router.navigate(
    ['header', 'allotement_case_list_details'],
    { queryParams: { queryType: encodedQueryType } }
  );
}


  // navigateWithQueryType() {
  //   const encryptedQueryType = this.encryptionService.encrypt('1');  // QueryType = 1
  //   const encodedQueryType = encodeURIComponent(encryptedQueryType);

  //   this.router.navigate(
  //     ['header', 'allotement_case_list_details'],
  //     { queryParams: { queryType: encodedQueryType } }
  //   );
  // }

  private initializeSession(): void {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.role_id = res.role_id;
        this.dept_id = res.dept_id;
        this.user_code = res.user_code;
        this.getAllotmentCount();
      },
      error: (err) => {
        console.error('Error fetching session:', err);
      }
    });
  }

  getAllotmentCount() {
    if (!this.dept_id || !this.user_code || !this.role_id) return;

    const params = new HttpParams()
      .set('dept_id', this.dept_id)
      .set('user_code', this.user_code)
      .set('role_id', this.role_id);

    this.ds.getData('allotment_count', { params }).subscribe(
      (data: any) => {
        const result = Array.isArray(data) ? data[0] : data;
        this.directCases = +result?.DirectCases || 0;
        this.selfExamine = +result?.SelfExamine || 0;
        this.directorate = +result?.Directorate || 0;
        this.returnCase = +result?.returncase || 0;
      },
      (error) => {
        console.error('Error fetching allotment count:', error);
      }
    );
  }
}
