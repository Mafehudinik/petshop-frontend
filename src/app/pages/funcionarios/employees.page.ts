import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss']
})
export class EmployeesPage implements OnInit {
  employees: any[] = [];
  filteredEmployees: any[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditing: boolean = false;
  
  currentEmployee: any = {
    name: '',
    role: '',
    commission_rate: 0,
    active: 1
  };

  currentUser: any = null;
  userInitials: string = 'AD';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.userInitials = this.currentUser.name?.substring(0, 2).toUpperCase() || 'AD';
    }
  }

  loadEmployees() {
    this.apiService.get('/employees').subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
      },
      error: (err) => console.error('Erro ao carregar funcionários:', err)
    });
  }

  filterEmployees() {
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees.filter(emp =>
      emp.name.toLowerCase().includes(term) ||
      emp.role?.toLowerCase().includes(term)
    );
  }

  addEmployee() {
    this.isEditing = false;
    this.currentEmployee = {
      name: '',
      role: '',
      commission_rate: 0,
      active: 1
    };
    this.showModal = true;
  }

  editEmployee(employee: any) {
    this.isEditing = true;
    this.currentEmployee = { ...employee };
    this.showModal = true;
  }

  saveEmployee() {
    if (this.isEditing) {
      this.apiService.put(`/employees/${this.currentEmployee.id}`, this.currentEmployee).subscribe({
        next: () => {
          this.loadEmployees();
          this.closeModal();
        },
        error: (err) => console.error('Erro ao atualizar funcionário:', err)
      });
    } else {
      this.apiService.post('/employees', this.currentEmployee).subscribe({
        next: () => {
          this.loadEmployees();
          this.closeModal();
        },
        error: (err) => console.error('Erro ao criar funcionário:', err)
      });
    }
  }

  deleteEmployee(id: number) {
    if (confirm('Deseja realmente remover este funcionário?')) {
      this.apiService.delete(`/employees/${id}`).subscribe({
        next: () => this.loadEmployees(),
        error: (err) => console.error('Erro ao remover funcionário:', err)
      });
    }
  }

  closeModal() {
    this.showModal = false;
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
