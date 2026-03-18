import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  stats: any = {};
  todayAppointments: any[] = [];
  hotelPets: any[] = [];
  currentUser: any;
  today: string = '';
  userInitials: string = 'AD';

  // Dados do gráfico de barras (faturamento semanal)
  weekData = [
    { label: 'Seg', height: 55,  active: false },
    { label: 'Ter', height: 72,  active: false },
    { label: 'Qua', height: 48,  active: false },
    { label: 'Qui', height: 82,  active: false },
    { label: 'Sex', height: 90,  active: true  },
    { label: 'Sáb', height: 30,  active: false },
    { label: 'Dom', height: 10,  active: false },
  ];

  // Serviços do dia (populados via API ou mock)
  dailyServices: { name: string; count: number; color: string }[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setToday();
    this.loadDashboard();
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user?.name) {
        this.userInitials = user.name
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
      }
    });
  }

  setToday() {
    const now = new Date();
    this.today = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    // Marca o dia da semana correto no gráfico
    const dayIndex = (now.getDay() + 6) % 7; // seg=0 ... dom=6
    this.weekData = this.weekData.map((d, i) => ({ ...d, active: i === dayIndex }));
  }

  loadDashboard() {
    // Estatísticas gerais
    this.apiService.getDashboardStats().subscribe(
      (data: any) => {
        this.stats = data;
        this.buildDailyServices(data);
      },
      (error: any) => console.error('Erro ao carregar estatísticas:', error)
    );

    // Agendamentos do dia
    this.apiService.getTodayAppointments().subscribe(
      (data: any[]) => { this.todayAppointments = data; },
      (error: any) => console.error('Erro ao carregar agendamentos:', error)
    );

    // Pets no hotel (adicione este endpoint no ApiService se ainda não existir)
    if (typeof (this.apiService as any).getActiveHotel === 'function') {
      (this.apiService as any).getActiveHotel().subscribe(
        (data: any[]) => { this.hotelPets = this.mapHotelUrgency(data); },
        (error: any) => console.error('Erro ao carregar hotel:', error)
      );
    }
  }

  /** Monta a lista de serviços do dia a partir das estatísticas */
  buildDailyServices(data: any) {
    const palette = ['#1b5e35', '#2e7d4f', '#97C459', '#d0e8d8'];
    const raw: { name: string; count: number }[] = data?.dailyServices || [
      { name: 'Banho',          count: data?.serviceBreakdown?.banho       || 0 },
      { name: 'Tosa',           count: data?.serviceBreakdown?.tosa        || 0 },
      { name: 'Hidratação',     count: data?.serviceBreakdown?.hidratacao  || 0 },
      { name: 'Corte de unhas', count: data?.serviceBreakdown?.unhas       || 0 },
    ];
    this.dailyServices = raw
      .filter(s => s.count > 0)
      .map((s, i) => ({ ...s, color: palette[i % palette.length] }));
  }

  /** Define urgência de cada hospedagem com base na data de check-out */
  mapHotelUrgency(pets: any[]): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return pets.map(p => {
      const co = new Date(p.checkout_date);
      co.setHours(0, 0, 0, 0);
      const diff = Math.round((co.getTime() - today.getTime()) / 86400000);
      let urgency = 'ok';
      let urgencyLabel = 'OK';
      if (diff <= 0)      { urgency = 'urgent'; urgencyLabel = 'Hoje'; }
      else if (diff === 1){ urgency = 'soon';   urgencyLabel = 'Amanhã'; }
      return { ...p, urgency, urgencyLabel };
    });
  }

  /** Rótulo legível para o status do agendamento */
  statusLabel(status: string): string {
    const map: Record<string, string> = {
      concluido:  'Concluído',
      confirmado: 'Em andamento',
      agendado:   'Aguardando',
    };
    return map[status] || status;
  }

  logout() {
    this.authService.logout();
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}