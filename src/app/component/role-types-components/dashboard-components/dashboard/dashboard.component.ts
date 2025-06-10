import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpParams } from '@angular/common/http';
import { LoadingService } from '../../../../services/loading.service';
import { DataService } from '../../../../services/data.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  dept_id = '';
  role_id = '';
  user_code = '';
  date = '';

  // Petition data
  total_petition = 0;
  without_case_no = 0;
  with_case_no = 0;
  upto_five_days = 0;
countMap: Record<string, number> = {};

  // Dashboard data
  reply_filed = 0;
  pending_reply_filed = 0;
  total_alloted = 0;
  pending_for_total_alloted = 0;
  pending_cases = 0;
  disposed_cases = 0;
  total_cases = 0;
  court_oerder_compliance_open = 0;
  court_oerder_compliance_closed = 0;
  court_oerder_compliance_total = 0;
  court_oerder_compliance_not_alloted = 0;

  // Calendar
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth(); // 0-based
  currentYear = this.currentDate.getFullYear();
  daysInMonth: (number | null)[] = [];
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private ds: DataService,
    private router: Router,
    public loading :LoadingService
  ) {}

  ngOnInit() {
    this.initializeSession();
    this.generateYears();
    this.generateCalendar();
    // Initialize date string (0-based month passed in)
    this.date = this.formatDateToYearMonth(this.currentYear, this.currentMonth);
    // this.getDashboardData();
  }

  private initializeSession(): void {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.dept_id = res.dept_id;
        this.user_code = res.user_code;
        this.role_id = res.role_id;
        this.getDashboardData();
        this.getCount();
      },
      error: (err) => {
        console.error('Error fetching session:', err);
      }
    });
  }

  generateYears() {
    const startYear = this.currentYear - 10;
    const endYear = this.currentYear + 5000;
    for (let year = startYear; year <= endYear; year++) {
      this.years.push(year);
    }
  }

  generateCalendar() {
    this.daysInMonth = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    // pad leading blanks
    for (let i = 0; i < firstDay; i++) {
      this.daysInMonth.push(null);
    }
    // actual days
    for (let day = 1; day <= totalDays; day++) {
      this.daysInMonth.push(day);
    }

    // update date string each time calendar regenerates
    this.date = this.formatDateToYearMonth(this.currentYear, this.currentMonth);
    this.getCount();
  }

  /** Called on change of either dropdown */
  onMonthOrYearChange() {
    this.generateCalendar();
  }

  /** Always receives monthIndex as 0-based */
  private formatDateToYearMonth(year: number, monthIndex: number): string {
    const mm = (monthIndex + 1).toString().padStart(2, '0');
    return `${year}-${mm}`;
  }

  isSaturday(day: number | null): boolean {
    if (day === null) return false;
    return new Date(this.currentYear, this.currentMonth, day).getDay() === 6;
  }

  isSunday(day: number | null): boolean {
    if (day === null) return false;
    return new Date(this.currentYear, this.currentMonth, day).getDay() === 0;
  }


getDashboardData() {
  // this.loading.show();
  const params = new HttpParams()
    .set('dept_id', this.dept_id)
    .set('user_code', this.user_code)
    .set('role_id', this.role_id);
// console.log(params);

    
  this.ds.getData('dashboard-department-wise', { params }).subscribe({
    next: (res: any) => {
      const p = res.petitionData;
      const d = res.dashboardData;

      this.total_petition = p.total_petition;
      this.without_case_no = p.without_case_no;
      this.with_case_no = p.with_case_no;
      this.upto_five_days = p.upto_five_days;

      this.reply_filed = d.repy_filed;
      this.pending_reply_filed = d.pending_repy_filed;
      this.total_alloted = d.total_alloted;
      this.pending_for_total_alloted = d.pending_for_total_alloted;
      this.pending_cases = d.pending_cases;
      this.disposed_cases = d.disposed_cases;
      this.total_cases = d.total_cases;
      this.court_oerder_compliance_total = d.court_oerder_compliance_total;
      this.court_oerder_compliance_not_alloted = d.court_oerder_compliance_not_alloted;
      this.loading.hide(); // ✅ move here
    },
    error: (err) => {
      console.error('Error fetching dashboard data', err);
      this.loading.hide(); // ✅ hide on error
    }
  });
}

  getCountForDay(day: number | null): number {
  if (day === null) return 0;

  const mm = (this.currentMonth + 1).toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  const key = `${this.currentYear}-${mm}-${dd}`;

  return this.countMap[key] || 0;
}

getCount() {
  const params = new HttpParams()
    .set('dept_id', this.dept_id)
    .set('user_code', this.user_code)
    .set('role_id', this.role_id)
    .set('date', this.date);

  this.ds.getData('total_count', { params }).subscribe((res: any[]) => {
    this.countMap = {};
    res.forEach(entry => {
      const d = new Date(entry.date_next_list);
      const key = d.toISOString().split('T')[0]; // "YYYY-MM-DD"
      this.countMap[key] = entry.cnt;
    });
    console.log('Count map:', this.countMap);
  });
}

  // getCount() {
  //   const params = new HttpParams()
  //     .set('dept_id', this.dept_id)
  //     .set('user_code', this.user_code)
  //     .set('role_id', this.role_id)
  //     .set('date', this.date);

  //   this.ds.getData('total_count', { params }).subscribe((res: any) => {
  //     console.log('Total count data:', res);
  //   });
  // }

  navigateToPage() {
    this.router.navigate(['header', 'dashboard_detail_page']);
  }

  navigateToDate(day: number | null) {
    if (day === null) return;

    const mm = (this.currentMonth + 1).toString().padStart(2, '0');
    const dd = day.toString().padStart(2, '0');
    const selectedDate = `${this.currentYear}-${mm}-${dd}`;
    const encryptedDate = btoa(selectedDate);

    this.router.navigate(['header', 'upcoming_cause_list', encryptedDate]);
  }
}
