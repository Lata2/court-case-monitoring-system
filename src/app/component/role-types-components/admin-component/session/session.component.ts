import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-session',
  standalone: true,
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css', '../menu-control/menu-control.component.css'],
  imports: [CommonModule, FormsModule]
})
export class SessionComponent implements OnInit {
  sessions: any[] = [];
  filteredSessions: any[] = [];

  searchText: string = '';
  roleFilter: string = '';
  minMinutes: number | null = null;
  maxMinutes: number | null = null;
  endDate: string = '';

  roleTypes: string[] = [];

  loading: boolean = false;
  errorMessage: string = '';

  private searchTimeout: any;

  constructor(private ds: DataService) {}

  ngOnInit(): void {
    this.getSessionDetails();
    this.getDropdownData();
  }

  getDropdownData() {
    this.ds.getData('menu-control?type=dropdown').subscribe(
      (response: any) => {
        const roles: any[] = response.results || [];
        this.roleTypes = [...new Set(roles.map(r => r.role_type))];
      },
      (error) => {
        console.error('Error fetching role types:', error);
        this.errorMessage = 'Failed to load role types.';
      }
    );
  }

  getSessionDetails() {
    this.loading = true;
    this.ds.getData('session').subscribe(
      (response: any) => {
        this.sessions = response.session || [];
        this.filteredSessions = [...this.sessions]; // show all initially
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching session details:', error);
        this.errorMessage = 'Failed to load session details.';
        this.loading = false;
      }
    );
  }

  applyFilters() {
    const search = this.searchText.trim().toLowerCase();

    this.filteredSessions = this.sessions.filter(session => {
      const userId = String(session.user_id || '').toLowerCase();
      const userCode = String(session.user_code || '').toLowerCase();
      const roleType = String(session.role_type || '').toLowerCase();
      const sessionId = String(session.session_id || '').toLowerCase();

      const matchesSearch =
        !search ||
        userId.includes(search) ||
        userCode.includes(search) ||
        roleType.includes(search) ||
        sessionId.includes(search);

      const matchesRole =
        !this.roleFilter || roleType === this.roleFilter.toLowerCase();

      const matchesMinMinutes =
        this.minMinutes === null || session.remaining_minutes >= this.minMinutes;

      const matchesMaxMinutes =
        this.maxMinutes === null || session.remaining_minutes <= this.maxMinutes;

      const sessionDate = new Date(session.expires_at);
      const matchesEndDate =
        !this.endDate || sessionDate <= this.getEndOfDay(this.endDate);

      return (
        matchesSearch &&
        matchesRole &&
        matchesMinMinutes &&
        matchesMaxMinutes &&
        matchesEndDate
      );
    });
  }

  onSearchInput() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  getEndOfDay(dateStr: string): Date {
    const date = new Date(dateStr);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  terminateSession(session_id: string) {
    if (confirm('Are you sure you want to terminate this session?')) {
      this.ds.terminateSession(session_id).subscribe(
        (response) => {
          console.log('Session terminated:', response);
          this.getSessionDetails();
        },
        (error) => {
          console.error('Error terminating session:', error);
          alert('Failed to terminate session.');
        }
      );
    }
  }
}
