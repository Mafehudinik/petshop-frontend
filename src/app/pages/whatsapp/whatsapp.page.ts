import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.page.html',
  styleUrls: ['./whatsapp.page.scss']
})
export class WhatsappPage implements OnInit {
  config: any = {
    api_key: '',
    phone_number: '',
    auto_confirm: 1,
    auto_reminder: 1,
    auto_ready: 1,
    active: 0
  };

  messageHistory: any[] = [];
  appointments: any[] = [];
  selectedAppointment: any = null;
  showSendModal: boolean = false;
  messageType: string = 'confirmation';

  currentUser: any = null;
  userInitials: string = 'AD';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadConfig();
    this.loadMessageHistory();
    this.loadTodayAppointments();
  }

  loadCurrentUser() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.userInitials = this.currentUser.name?.substring(0, 2).toUpperCase() || 'AD';
    }
  }

  loadConfig() {
    this.apiService.get('/whatsapp/config').subscribe({
      next: (data) => this.config = data,
      error: (err) => console.error('Erro ao carregar configuração:', err)
    });
  }

  saveConfig() {
    this.apiService.put('/whatsapp/config', this.config).subscribe({
      next: () => {
        alert('Configuração salva com sucesso!');
      },
      error: (err) => console.error('Erro ao salvar configuração:', err)
    });
  }

  loadMessageHistory() {
    this.apiService.get('/whatsapp/history').subscribe({
      next: (data) => this.messageHistory = data,
      error: (err) => console.error('Erro ao carregar histórico:', err)
    });
  }

  loadTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    this.apiService.get(`/appointments?date=${today}`).subscribe({
      next: (data) => this.appointments = data,
      error: (err) => console.error('Erro ao carregar agendamentos:', err)
    });
  }

  openSendModal(appointment: any, type: string) {
    this.selectedAppointment = appointment;
    this.messageType = type;
    this.showSendModal = true;
  }

  sendMessage() {
    if (!this.selectedAppointment) return;

    let endpoint = '';
    switch (this.messageType) {
      case 'confirmation':
        endpoint = '/whatsapp/send/confirmation';
        break;
      case 'reminder':
        endpoint = '/whatsapp/send/reminder';
        break;
      case 'ready':
        endpoint = '/whatsapp/send/ready';
        break;
    }

    this.apiService.post(endpoint, { appointment_id: this.selectedAppointment.id }).subscribe({
      next: (response) => {
        alert(response.message);
        this.loadMessageHistory();
        this.closeSendModal();
      },
      error: (err) => {
        alert(err.error?.error || 'Erro ao enviar mensagem');
      }
    });
  }

  closeSendModal() {
    this.showSendModal = false;
    this.selectedAppointment = null;
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  getMessageTypeLabel(type: string): string {
    const labels: any = {
      'confirmation': 'Confirmação',
      'reminder': 'Lembrete',
      'ready': 'Pet Pronto'
    };
    return labels[type] || type;
  }
}
