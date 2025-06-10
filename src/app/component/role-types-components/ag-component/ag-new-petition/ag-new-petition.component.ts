// ag-new-petition.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-ag-new-petition',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './ag-new-petition.component.html',
  styleUrls: ['./ag-new-petition.component.css']
})
export class AgNewPetitionComponent implements OnInit, OnDestroy {
  form: FormGroup;

  dist_code = '';
  user_code = '';
  user_id = '';
  case_type = '';

  districts: any[] = [];
  policeStations: any[] = [];
  lawOfficers: any[] = [];
  caseNatures: any[] = [];
  concernDepartments: any[] = [];
  years: number[] = [];
  dueDates: string[] = [];

  caseTypes = [
    { value: '1', name: 'Civil' },
    { value: '2', name: 'Criminal' }
  ];
  yearOptions: any[] = [];

  partyModel = {
    name: '',
    father_name: '',
    address: '',
    district: ''
  };
  party: any[] = [];
  isEditingParty = false;
  editingPartyIndex = -1;

  respondentModel = {
    name: '',
    father_name: '',
    address: '',
    district: '',
    department: ''
  };
  respondents: any[] = [];
  isEditingRespondent = false;
  editingRespondentIndex = -1;

  districtMap: Map<string, string> = new Map();
  departmentMap: Map<string, string> = new Map();
  
  private destroy$ = new Subject<void>();

  constructor(private ds: DataService, private fb: FormBuilder) {
    this.form = this.fb.group({
      ci_cri: ['', Validators.required],
      pet_adv: ['', Validators.required],
      pet_adv_cd: ['', Validators.required],
      pet_adv_mobile: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],
      pet_adv_add: [''],
      subject: [''],
      regcase_type: ['', Validators.required],
      ariser_from: [''],
      arisereg_no: [''],
      arisereg_year: [''],
      law_officer: [null, Validators.required],
      date_of_due: ['', Validators.required],
      date_of_receiving: ['', Validators.required],
      concerned_officer_id: [''],
      police_st_code: [''],
      police_dist_code: [''],
      fir_no: [''],
      fir_year: [''],
      under_sec: [''],
      fir_desc: ['']
    });
  }

  ngOnInit(): void {
    this.initializeSession();
    this.getDistricts();
    this.getConcernDepartments();
    this.loadYears();
    this.loadDueDates();

    // Create year options
    this.yearOptions = this.years.map(y => ({ value: y, label: y.toString() }));

    // Subscribe to case type changes
    this.form.get('ci_cri')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.case_type = value;
      if (value) {
        this.getCaseNature();
        this.getLawOfficer();
      } else {
        this.caseNatures = [];
        this.lawOfficers = [];
      }
    });

    // Subscribe to district changes for police stations
    this.form.get('police_dist_code')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        this.dist_code = value;
        this.getPoliceStations();
      } else {
        this.policeStations = [];
        this.form.get('police_st_code')?.reset();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSession() {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.user_code = res.user_code;
        this.user_id = res.user_id;
      },
      error: err => console.error('Error fetching session:', err)
    });
  }

  getDistricts() {
    this.ds.getData('districts').subscribe(
      (data: any) => {
        this.districts = data;
        data.forEach((dist: any) => {
          this.districtMap.set(dist.value.toString(), dist.text);
        });
      },
      err => console.error('Error fetching districts:', err)
    );
  }

  getPoliceStations() {
    this.ds.getData('police_stations', { params: { dist_code: this.dist_code } }).subscribe(
      (data: any) => this.policeStations = data,
      err => console.error('Error fetching police stations:', err)
    );
  }

  getCaseNature() {
    this.ds.getData('ag_case_natures', { params: { case_type: this.case_type } }).subscribe(
      (data: any) => this.caseNatures = data,
      err => console.error('Error fetching case natures:', err)
    );
  }

  getLawOfficer() {
    this.ds.getData('advocates', { params: { case_type: this.case_type } }).subscribe(
      (data: any) => this.lawOfficers = data,
      err => console.error('Error fetching law officers:', err)
    );
  }

  getConcernDepartments() {
    this.ds.getData('concern_dept').subscribe(
      (data: any) => {
        this.concernDepartments = data;
        data.forEach((dept: any) => {
          this.departmentMap.set(dept.user_code.toString(), dept.name);
        });
      },
      err => console.error('Error fetching concern departments:', err)
    );
  }

  loadYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 30; i--) this.years.push(i);
  }

  loadDueDates() {
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const future = new Date(today);
      future.setDate(today.getDate() + i);
      this.dueDates.push(future.toISOString().split('T')[0]);
    }
  }

  addParty() {
    if (!this.partyModel.name || !this.partyModel.district) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Party Name and District are required fields.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isEditingParty) {
      this.party[this.editingPartyIndex] = { ...this.partyModel };
      this.isEditingParty = false;
      this.editingPartyIndex = -1;
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'Party updated successfully!',
        timer: 1500
      });
    } else {
      this.party.push({ ...this.partyModel });
      Swal.fire({
        icon: 'success',
        title: 'Added',
        text: 'Party added successfully!',
        timer: 1500
      });
    }

    this.resetPartyForm();
  }

  editParty(index: number) {
    this.partyModel = { ...this.party[index] };
    this.isEditingParty = true;
    this.editingPartyIndex = index;
  }

  deleteParty(index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this party?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.party.splice(index, 1);
        if (this.isEditingParty && this.editingPartyIndex === index) {
          this.resetPartyForm();
        }
        Swal.fire('Deleted!', 'Party has been deleted.', 'success');
      }
    });
  }

  resetPartyForm() {
    this.partyModel = { name: '', father_name: '', address: '', district: '' };
    this.isEditingParty = false;
    this.editingPartyIndex = -1;
  }

  cancelEditParty() {
    this.resetPartyForm();
    Swal.fire({
      icon: 'info',
      title: 'Cancelled',
      text: 'Edit operation cancelled',
      timer: 1000
    });
  }

  addRespondent() {
    if (!this.respondentModel.name || !this.respondentModel.district || !this.respondentModel.department) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Respondent Name, District and Department are required fields.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isEditingRespondent) {
      this.respondents[this.editingRespondentIndex] = { ...this.respondentModel };
      this.isEditingRespondent = false;
      this.editingRespondentIndex = -1;
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'Respondent updated successfully!',
        timer: 1500
      });
    } else {
      this.respondents.push({ ...this.respondentModel });
      Swal.fire({
        icon: 'success',
        title: 'Added',
        text: 'Respondent added successfully!',
        timer: 1500
      });
    }

    this.resetRespondentForm();
  }

  editRespondent(index: number) {
    this.respondentModel = { ...this.respondents[index] };
    this.isEditingRespondent = true;
    this.editingRespondentIndex = index;
  }

  deleteRespondent(index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this respondent?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.respondents.splice(index, 1);
        if (this.isEditingRespondent && this.editingRespondentIndex === index) {
          this.resetRespondentForm();
        }
        Swal.fire('Deleted!', 'Respondent has been deleted.', 'success');
      }
    });
  }

  resetRespondentForm() {
    this.respondentModel = { name: '', father_name: '', address: '', district: '', department: '' };
    this.isEditingRespondent = false;
    this.editingRespondentIndex = -1;
  }

  cancelEditRespondent() {
    this.resetRespondentForm();
    Swal.fire({
      icon: 'info',
      title: 'Cancelled',
      text: 'Edit operation cancelled',
      timer: 1000
    });
  }

  getDistrictName(code: string): string {
    if (!code) return 'N/A';
    return this.districtMap.get(code.toString()) || 'N/A';
  }

  getDepartmentName(code: string): string {
    if (!code) return 'N/A';
    return this.departmentMap.get(code.toString()) || 'N/A';
  }

  onSubmit() {
    if (this.party.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Parties',
        text: 'Please add at least one party',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.respondents.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Respondents',
        text: 'Please add at least one respondent',
        confirmButtonText: 'OK'
      });
      return;
    }

    const law = this.form.get('law_officer')?.value;

    const payload = {
      year: new Date().getFullYear(),
      ci_cri: this.form.get('ci_cri')?.value,
      pet_adv: this.form.get('pet_adv')?.value,
      pet_adv_cd: this.form.get('pet_adv_cd')?.value,
      pet_adv_mobile: this.form.get('pet_adv_mobile')?.value,
      subject: this.form.get('subject')?.value,
      regcase_type: this.form.get('regcase_type')?.value,
      ariser_from: this.form.get('ariser_from')?.value,
      arisereg_no: this.form.get('arisereg_no')?.value,
      arisereg_year: this.form.get('arisereg_year')?.value,
      law_officer_cd: law?.value || '',
      law_officer: law?.text || null,
      date_of_due: this.form.get('date_of_due')?.value,
      date_of_receiving: this.form.get('date_of_receiving')?.value,
      pet_adv_add: this.form.get('pet_adv_add')?.value,
      police_st_code: this.form.get('police_st_code')?.value,
      police_dist_code: this.form.get('police_dist_code')?.value,
      fir_no: this.form.get('fir_no')?.value,
      fir_year: this.form.get('fir_year')?.value,
      under_sec: this.form.get('under_sec')?.value,
      fir_desc: this.form.get('fir_desc')?.value,
      user_code: this.user_code,
      user_id: this.user_id,

      parties: this.party.map((p, i) => ({
        party_no: i + 1,
        name: p.name,
        father_name: p.father_name,
        party_type: 1,
        pet_address: p.address,
        pet_dist_code: p.district,
        concerned_officer_id: 0
      })),

      respondents: this.respondents.map((r, i) => ({
        party_no: i + 1,
        name: r.name,
        father_name: r.father_name,
        party_type: 2,
        pet_address: r.address,
        pet_dist_code: r.district,
        concerned_officer_id: r.department || 0
      }))
    };

    this.ds.postData('save_petition', payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Petition saved successfully, your AGCINO is ' + res.agcino,
          confirmButtonText: 'OK'
        }).then(() => {
          this.form.reset();
          this.party = [];
          this.respondents = [];
        });
      },
      error: err => {
        console.error('Save error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to save petition. ' + (err.error?.message || ''),
          confirmButtonText: 'Retry'
        });
      }
    });
  }

 restrictInput(event: KeyboardEvent) {
  const inputElement = event.target as HTMLInputElement;
  const inputChar = event.key;

  // Block 0–5 for first character
  if (inputElement.value.length === 0 && /^[0-5]$/.test(inputChar)) {
    event.preventDefault();
    return;
  }

  // Allow only digits 0–9
  if (!/^[0-9]$/.test(inputChar)) {
    event.preventDefault();
  }
}


limitDigits(event: any) {
  let inputValue = event.target.value;
  if (inputValue.length > 10) {
    event.target.value = inputValue.slice(0, 10);
    this.form.get('pet_adv_mobile')?.setValue(event.target.value);
  }
}


}