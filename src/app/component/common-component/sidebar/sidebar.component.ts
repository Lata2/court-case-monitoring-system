import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../../../services/data.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, MainHeaderComponent, NgFor, NgIf, MatIconModule, HttpClientModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() notificationCount: number = 0;

  userId: string = 'Guest';
  roleId: number = 0;
  expiresAt!: number;
  remainingTime: number = 0;
  formattedTime: string = '';
  timerInterval: any;

  sidebarOpen = false;
  activeDropdown = '';
  menuList: any[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private ds: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeSession();
  }

  private initializeSession(): void {
    this.ds.getData('sessiondetails', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.userId = res.user_id;
        this.roleId = Number(res.role_id);
        this.expiresAt = res.expiresAt;

        const currentTime = Date.now();
        this.remainingTime = Math.floor((this.expiresAt - currentTime) / 1000);

        if (this.remainingTime > 0) {
          this.startSessionTimer();
          this.loadMenu();
        } else {
          this.handleSessionExpired();
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  private startSessionTimer(): void {
    this.updateFormattedTime();
    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.updateFormattedTime();
      if (this.remainingTime <= 0) {
        this.handleSessionExpired();
      }
    }, 1000);
  }

  private updateFormattedTime(): void {
    const hours = Math.floor(this.remainingTime / 3600);
    const minutes = Math.floor((this.remainingTime % 3600) / 60);
    const seconds = this.remainingTime % 60;
    this.formattedTime = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  private handleSessionExpired(): void {
    clearInterval(this.timerInterval);
    alert('Session expired. Please login again.');
    this.logout();
  }

  logout(): void {
    this.ds.postData('/logout', {}, { withCredentials: true }).subscribe({
      next: () => {
        this.clearClientSession();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.clearClientSession();
        this.router.navigate(['/login']);
      }
    });
  }

  private clearClientSession(): void {
    sessionStorage.clear();
    localStorage.clear();
    clearInterval(this.timerInterval);
  }

  loadMenu(): void {
    this.ds.getData('menu', {
      params: { role_id: this.roleId.toString() }
    }).subscribe({
      next: (res: any) => {
        const flatMenu = Array.isArray(res.menu) ? res.menu : Object.values(res.menu);

        const menuMap: { [key: number]: any } = {};
        const nestedMenu: any[] = [];

        flatMenu.forEach((item: any) => {
          item.children = [];
          menuMap[item.menu_code] = item;
        });

        flatMenu.forEach((item: any) => {
          if (item.main_menu_code) {
            const parent = menuMap[item.main_menu_code];
            if (parent) parent.children.push(item);
          } else {
            nestedMenu.push(item);
          }
        });

        this.menuList = nestedMenu;
        // this.navigateToFirstMenuItem();
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }


  // private navigateToFirstMenuItem(): void {
  //   for (const item of this.menuList) {
  //     if (item.route) {
  //       this.router.navigate([`/header/${item.route}`]);
  //       break;
  //     }
  //     if (item.children?.length > 0) {
  //       const child = item.children.find((c: any) => c.route);

  //       if (child) {
  //         this.router.navigate([`/header/${child.route}`]);
  //         break;
  //       }
  //     }
  //   }
  // }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleDropdown(item: any): void {
    this.activeDropdown = this.activeDropdown === item.menu_code ? '' : item.menu_code;
  }

  navigateTo(item: any): void {
    if (item?.route) {
      this.router.navigate([`/header/${item.route}`]);
    }
  }

  ngOnDestroy(): void {
    this.clearClientSession();
  }
}
