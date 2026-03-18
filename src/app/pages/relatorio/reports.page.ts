import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss']
})
export class ReportsPage implements OnInit {
  activeTab: string = 'sales';
  
  // Relatórios
  salesReport: any[] = [];
  topProducts: any[] = [];
  topServices: any[] = [];
  topClients: any[] = [];
  appointmentsReport: any[] = [];
  hotelReport: any[] = [];
  monthlyRevenue: any[] = [];

  // Filtros
  startDate: string = '';
  endDate: string = '';
  selectedYear: string = new Date().getFullYear().toString();

  currentUser: any = null;
  userInitials: string = 'AD';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.setDefaultDates();
    this.loadReports();
  }

  loadCurrentUser() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.userInitials = this.currentUser.name?.substring(0, 2).toUpperCase() || 'AD';
    }
  }

  setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  loadReports() {
    this.loadSalesReport();
    this.loadTopProducts();
    this.loadTopServices();
    this.loadTopClients();
    this.loadAppointmentsReport();
    this.loadHotelReport();
    this.loadMonthlyRevenue();
  }

  loadSalesReport() {
    this.apiService.get(`/reports/sales?start_date=${this.startDate}&end_date=${this.endDate}`).subscribe({
      next: (data) => this.salesReport = data,
      error: (err) => console.error('Erro ao carregar relatório de vendas:', err)
    });
  }

  loadTopProducts() {
    this.apiService.get('/reports/top-products?limit=10').subscribe({
      next: (data) => this.topProducts = data,
      error: (err) => console.error('Erro ao carregar produtos:', err)
    });
  }

  loadTopServices() {
    this.apiService.get('/reports/top-services?limit=10').subscribe({
      next: (data) => this.topServices = data,
      error: (err) => console.error('Erro ao carregar serviços:', err)
    });
  }

  loadTopClients() {
    this.apiService.get('/reports/top-clients?limit=10').subscribe({
      next: (data) => this.topClients = data,
      error: (err) => console.error('Erro ao carregar clientes:', err)
    });
  }

  loadAppointmentsReport() {
    this.apiService.get(`/reports/appointments?start_date=${this.startDate}&end_date=${this.endDate}`).subscribe({
      next: (data) => this.appointmentsReport = data,
      error: (err) => console.error('Erro ao carregar agendamentos:', err)
    });
  }

  loadHotelReport() {
    this.apiService.get(`/reports/hotel?start_date=${this.startDate}&end_date=${this.endDate}`).subscribe({
      next: (data) => this.hotelReport = data,
      error: (err) => console.error('Erro ao carregar hotel:', err)
    });
  }

  loadMonthlyRevenue() {
    this.apiService.get(`/reports/monthly-revenue?year=${this.selectedYear}`).subscribe({
      next: (data) => this.monthlyRevenue = data,
      error: (err) => console.error('Erro ao carregar faturamento:', err)
    });
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  applyFilters() {
    this.loadReports();
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  getTotalRevenue(): number {
    return this.salesReport.reduce((sum, item) => sum + (item.revenue || 0), 0);
  }

  getTotalSales(): number {
    return this.salesReport.reduce((sum, item) => sum + (item.total_sales || 0), 0);
  }
}
