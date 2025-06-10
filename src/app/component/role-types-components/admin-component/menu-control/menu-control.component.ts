import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../../services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-control',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './menu-control.component.html',
  styleUrls: ['./menu-control.component.css']
})
export class MenuControlComponent implements OnInit {
  parentMenuOptions: any[] = [];
  
  menuItems: any[] = [];
  filteredItems: any[] = [];
  menuForm!: FormGroup;
  showModal: boolean = false;
  editingIndex: number | null = null;

  roleTypes: { role_id: number; role_type: string }[] = [];
  menuTypes = [
    { label: 'Parent', value: 1 },
    { label: 'Children', value: 0 }
  ];
  availableIcons: string[] = [];

  selectedRole: string = '';
  selectedMenuType: number | '' = '';
  selectedActiveStatus: boolean | '' = '';
  searchText: string = '';

  currentPage: number = 1;
  rowsPerPage: number = 15;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private ds: DataService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getMenuControl();
    this.getAvailableIcons();
    this.getRoleType();
  }

  initForm(): void {
    this.menuForm = this.fb.group({
      icon: ['menu', Validators.required],
      menu_name: ['', Validators.required],
      role_id: [null, Validators.required],
      menu_order: [1, Validators.required],
      children: [0, Validators.required],
      route: ['', Validators.required],
      is_active: [true],
      main_menu_code: [null]
    });
  }

  openModal(): void {
    this.showModal = true;
    this.editingIndex = null;
    this.menuForm.reset({
      icon: 'menu',
      menu_order: 1,
      children: 0,
      is_active: true,
      role_id: null,
      main_menu_code: null
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.editingIndex = null;
    this.menuForm.reset({
      icon: 'menu',
      menu_order: 1,
      children: 0,
      is_active: true,
      role_id: null,
      main_menu_code: null
    });
  }

  getMenuControl(): void {
    this.ds.getData('menu-control').subscribe({
      next: (res: any) => {

        this.menuItems = res.results.map((item: any) => ({

          ...item,
          children: item.children?.data?.[0] ?? 0,
          is_active: item.is_active?.data?.[0] === 1,
          is_new: item.is_new?.data?.[0] === 1
        }));

      this.parentMenuOptions = this.menuItems
          .filter(item => item.children === 1)
          .map(item => ({
            menu_code: item.menu_code,
            menu_name: item.menu_name
          }));

        // console.log("Menus with children = 1:", parentMenuOptions);


        // this.parentMenuOptions = this.menuItems.filter(menu =>
        //   this.menuItems.some(m => m.main_menu_code === menu.menu_code)
        // );


        this.applyFilters();
      },
      error: (err: any) => console.error("Error fetching menu items:", err)
    });
  }

  getRoleType(): void {
    this.ds.getData('role_types').subscribe({
      next: (res: any) => {
        this.roleTypes = res.results.map((item: any) => ({
          role_id: item.role_id,
          role_type: item.role_type
        }));
      },
      error: (err: any) => console.error("Error fetching role types:", err)
    });
  }

  getAvailableIcons(): void {
    this.ds.getData('menu-control?type=dropdown').subscribe({
      next: (res: any) => {
        const data = res.results;
        // Type assertion here to ensure data is an array of objects with string icon property
        const icons = (data as Array<{ icon: string }>).map(item => item.icon);
        this.availableIcons = [...new Set(icons)];
      },
      error: (err: any) => console.error("Error fetching icons:", err)
    });
  }

  applyFilters(): void {
    let filtered = [...this.menuItems];

    if (this.selectedRole) {
      filtered = filtered.filter(item => item.role_id === +this.selectedRole);
    }

    if (this.selectedMenuType !== '') {
      filtered = filtered.filter(item => item.children == this.selectedMenuType);
    }

    if (this.selectedActiveStatus !== '') {
      filtered = filtered.filter(item => item.is_active === (this.selectedActiveStatus === true));
    }

    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(query)
        )
      );
    }

    this.filteredItems = filtered;
    this.currentPage = 1;
  }

  filteredMenuItems(): any[] {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    return this.filteredItems.slice(startIndex, startIndex + this.rowsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.rowsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  submitMenuForm(): void {
    const formValue = this.menuForm.value;

    const formatDateForMySQL = (date: Date): string => {
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const payload = {
      ...formValue,
      is_active: formValue.is_active ? 1 : 0,
      is_new: 1,
      children: formValue.children == 1 ? 1 : 0,
      main_menu_code: formValue.main_menu_code !== '' ? formValue.main_menu_code : null,
      create_date: formatDateForMySQL(new Date())
    };

    if (this.editingIndex !== null) {
      const menu_code = this.menuItems[this.editingIndex].menu_code;
      this.ds.putData('menu-control', menu_code, payload).subscribe({
        next: () => {
          this.getMenuControl();
          this.closeModal();
        },
        error: err => console.error('Error updating menu:', err)
      });
    } else {
      this.ds.postData('menu-control', payload).subscribe({
        next: () => {
          this.getMenuControl();
          this.closeModal();
        },
        error: err => console.error('Error saving menu:', err)
      });
    }
  }

  editMenu(index: number): void {
    const selectedItem = this.filteredMenuItems()[index];
    this.editingIndex = this.menuItems.findIndex(item => item.menu_code === selectedItem.menu_code);

    if (this.editingIndex === -1) {
      console.error('Menu item not found for editing.');
      return;
    }

    const item = this.menuItems[this.editingIndex];

    this.menuForm.setValue({
      icon: item.icon || 'menu',
      menu_name: item.menu_name || '',
      role_id: item.role_id ?? null,
      children: item.children === 1 ? 1 : 0,
      menu_order: item.menu_order || 1,
      route: item.route || '',
      is_active: item.is_active,
      main_menu_code: item.main_menu_code ?? null
    });

    this.showModal = true;
  }

  deleteMenu(index: number): void {
    const realItem = this.filteredMenuItems()[index];
    const menu_code = realItem.menu_code;

    if (confirm(`Are you sure you want to delete '${realItem.menu_name}'?`)) {
      const payload = { is_deleted: 1 };
      this.ds.putData('menu-control', menu_code, payload).subscribe({
        next: () => {
          this.getMenuControl();
        },
        error: err => console.error('Error soft deleting menu:', err)
      });
    }
  }

  toggleActive(index: number): void {
    const realItem = this.filteredMenuItems()[index];
    const menu_code = realItem.menu_code;
    const newStatus = !realItem.is_active;

    const payload = {
      menu_code,
      is_active: newStatus ? 1 : 0
    };

    this.ds.putData('menu-control', menu_code, payload).subscribe({
      next: () => {
        const originalIndex = this.menuItems.findIndex(item => item.menu_code === menu_code);
        if (originalIndex !== -1) {
          this.menuItems[originalIndex].is_active = newStatus;
        }
        this.applyFilters();
      },
      error: err => console.error('Error updating menu status:', err)
    });
  }
}
