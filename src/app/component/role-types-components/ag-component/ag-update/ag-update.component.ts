import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ag-update',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ag-update.component.html',
  styleUrls: ['./ag-update.component.css']
})
export class AgUpdateComponent implements OnInit {
  form: FormGroup;

  dist_code = '';
  user_code = '';
  user_id = '';
  case_type = '';
  agcino: string = '';
  districts: any[] = [];
  policeStations: any[] = [];
  lawOfficers: any[] = [];
  caseNatures: any[] = [];
  concernDepartments: any[] = [];
  years: number[] = [];
  dueDates: string[] = [];

  partyModel = { name: '', father_name: '', address: '', district: '' };
  party: any[] = [];
  isEditingParty = false;
  editingPartyIndex = -1;

  respondentModel = { name: '', father_name: '', address: '', district: '', department: '' };
  respondents: any[] = [];
  isEditingRespondent = false;
  editingRespondentIndex = -1;

  districtMap: Map<string, string> = new Map();
  departmentMap: Map<string, string> = new Map();

  constructor(private ds: DataService, private fb: FormBuilder) {
    this.form = this.fb.group({
      ci_cri: ['', Validators.required],
      pet_adv: ['', Validators.required],
      pet_adv_cd: ['', Validators.required],
      pet_adv_mobile: [''],
      pet_adv_add: [''],
      subject: [''],
      regcase_type: ['', Validators.required],
      ariser_from: [''],
      arisereg_no: [''],
      arisereg_year: [''],
      law_officer_cd: ['', Validators.required],
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
  }

  initializeSession() {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.user_code = res.user_code;
        this.user_id = res.user_id;
      },
      error: err => console.error('Error fetching session:', err)
    });
  }

  getDistricts() {
    this.ds.getData('districts').subscribe(data => {
      this.districts = data;
      data.forEach((dist: any) => this.districtMap.set(dist.value.toString(), dist.text));
    });
  }

  onDistrictChange(event: any) {
    this.dist_code = event.target.value;
    this.getPoliceStations();
  }

  getPoliceStations() {
    this.ds.getData('police_stations', { params: { dist_code: this.dist_code } }).subscribe(
      (data: any) => this.policeStations = data,
      err => console.error('Error fetching police stations:', err)
    );
  }

  selectCaseType(event: any) {
    this.case_type = event.target.value;
    this.form.patchValue({ ci_cri: this.case_type });
    this.getCaseNature();
    this.getLawOfficer();
  }

  getCaseNature() {
    this.ds.getData('ag_case_natures', { params: { case_type: this.case_type } }).subscribe(
      (data: any) => this.caseNatures = data,
      err => console.error('Error fetching case natures:', err)
    );
  }

  getLawOfficer() {
    this.ds.getData('advocates', { params: { case_type: this.case_type } }).subscribe(
      (data: any) => {
        this.lawOfficers = data;
        if (this.form.value.law_officer_cd) {
          const selectedOfficer = this.lawOfficers.find(o => o.value == this.form.value.law_officer_cd);
          if (selectedOfficer) {
            this.form.patchValue({ law_officer_cd: selectedOfficer.value });
          }
        }
      },
      err => console.error('Error fetching law officers:', err)
    );
  }

  getConcernDepartments() {
    this.ds.getData('concern_dept').subscribe(data => {
      this.concernDepartments = data;
      data.forEach((dept: any) => this.departmentMap.set(dept.user_code.toString(), dept.name));
    });
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
      Swal.fire({ icon: 'warning', title: 'Warning', text: 'Party Name and District are required' });
      return;
    }

    const newParty = {
      party_no: this.isEditingParty ? this.editingPartyIndex + 1 : this.party.length + 1,
      party_type: 1,
      name: this.partyModel.name,
      father_name: this.partyModel.father_name,
      pet_address: this.partyModel.address,
      pet_dist_code: this.partyModel.district,
      concerned_officer_id: 0
    };

    if (this.isEditingParty) {
      this.party[this.editingPartyIndex] = newParty;
    } else {
      this.party.push(newParty);
    }

    this.resetPartyForm();
  }

  editParty(index: number) {
    const p = this.party[index];
    this.partyModel = {
      name: p.name,
      father_name: p.father_name,
      address: p.pet_address,
      district: p.pet_dist_code
    };
    this.isEditingParty = true;
    this.editingPartyIndex = index;
  }

  deleteParty(index: number) {
    if (confirm('Delete this party?')) {
      this.party.splice(index, 1);
      if (this.isEditingParty && this.editingPartyIndex === index) this.resetPartyForm();
    }
  }

  resetPartyForm() {
    this.partyModel = { name: '', father_name: '', address: '', district: '' };
    this.isEditingParty = false;
    this.editingPartyIndex = -1;
  }

  cancelEditParty() {
    this.resetPartyForm();
  }

  addRespondent() {
    if (!this.respondentModel.name || !this.respondentModel.district || !this.respondentModel.department) {
      Swal.fire({ icon: 'warning', title: 'Warning', text: 'Respondent Name, District and Department are required' });
      return;
    }

    const newResp = {
      party_no: this.isEditingRespondent ? this.editingRespondentIndex + 1 : this.respondents.length + 1,
      party_type: 2,
      name: this.respondentModel.name,
      father_name: this.respondentModel.father_name,
      pet_address: this.respondentModel.address,
      pet_dist_code: this.respondentModel.district,
      concerned_officer_id: this.respondentModel.department
    };

    if (this.isEditingRespondent) {
      this.respondents[this.editingRespondentIndex] = newResp;
    } else {
      this.respondents.push(newResp);
    }

    this.resetRespondentForm();
  }

  editRespondent(index: number) {
    const r = this.respondents[index];
    this.respondentModel = {
      name: r.name,
      father_name: r.father_name,
      address: r.pet_address,
      district: r.pet_dist_code,
      department: r.concerned_officer_id
    };
    this.isEditingRespondent = true;
    this.editingRespondentIndex = index;
  }

  deleteRespondent(index: number) {
    if (confirm('Delete this respondent?')) {
      this.respondents.splice(index, 1);
      if (this.isEditingRespondent && this.editingRespondentIndex === index) this.resetRespondentForm();
    }
  }

  resetRespondentForm() {
    this.respondentModel = { name: '', father_name: '', address: '', district: '', department: '' };
    this.isEditingRespondent = false;
    this.editingRespondentIndex = -1;
  }

  cancelEditRespondent() {
    this.resetRespondentForm();
  }

  getDistrictName(code: string): string {
    return code ? this.districtMap.get(code.toString()) || 'N/A' : 'N/A';
  }

  getDepartmentName(code: string): string {
    return code ? this.departmentMap.get(code.toString()) || 'N/A' : 'N/A';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  }

  onSearch(): void {
    if (!this.agcino) {
      Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please enter AGCINO number' });
      return;
    }

    this.ds.getData('petition', { params: { agcino: this.agcino } }).subscribe({
      next: (response: any) => {
        if (!response || !response.petition) {
          Swal.fire({ icon: 'info', title: 'No Results', text: 'No petition found for the given AGCINO.' });
          return;
        }
        const data = response.petition;
        const parties = response.parties || [];
        const respondents = response.respondents || [];

        this.case_type = data.ci_cri;
        this.getCaseNature();
        this.getLawOfficer();

        this.form.patchValue({
          pet_adv: data.pet_adv,
          pet_adv_cd: data.pet_adv_cd,
          pet_adv_mobile: data.pet_adv_mobile,
          pet_adv_add: data.pet_adv_add,
          subject: data.subject,
          ci_cri: data.ci_cri,
          regcase_type: data.regcase_type,
          ariser_from: data.ariser_from,
          arisereg_no: data.arisereg_no,
          arisereg_year: data.arisereg_year,
          law_officer_cd: data.law_officer_cd,
          date_of_due: this.formatDate(data.date_of_due),
          date_of_receiving: this.formatDate(data.date_of_receiving),
          concerned_officer_id: data.concerned_officer_id,
          police_st_code: data.police_st_code,
          police_dist_code: data.police_dist_code,
          fir_no: data.fir_no,
          fir_year: data.fir_year,
          under_sec: data.under_sec,
          fir_desc: data.fir_desc
        });

        this.party = parties.map((p: any, i: number) => ({
          party_no: i + 1,
          party_type: 1,
          name: p.name,
          father_name: p.father_name,
          pet_address: p.pet_address,
          pet_dist_code: p.pet_dist_code,
          concerned_officer_id: 0
        }));
        this.respondents = respondents.map((r: any, i: number) => ({
          party_no: i + 1,
          party_type: 2,
          name: r.name,
          father_name: r.father_name,
          pet_address: r.pet_address,
          pet_dist_code: r.pet_dist_code,
          concerned_officer_id: r.concerned_officer_id
        }));
      },
      error: err => {
        console.error('Error fetching data:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not fetch petition data.' });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please fill in all required fields.' });
      return;
    }

    const lawOfficer = this.lawOfficers.find(o => o.value == this.form.value.law_officer_cd);
    const lawOfficerText = lawOfficer ? lawOfficer.text : '';

    const payload = {
      ...this.form.value,
      agcino: this.agcino,
      law_officer: lawOfficerText,
      parties: this.party,
      respondents: this.respondents,
      created_by: this.user_id,
      created_date: new Date().toISOString()
    };

    this.ds.putData('update_petition', this.agcino, payload).subscribe({
      next: () => Swal.fire({ icon: 'success', title: 'Success', text: 'Petition updated successfully.' }),
      error: err => {
        console.error('Update failed:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update petition.' });
      }
    });
  }
}
