import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';

const AVATAR_PALETTES = [
  { bg: '#EAF3DE', color: '#1b5e35' },
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#FBEAF0', color: '#993556' },
  { bg: '#EEEDFE', color: '#534AB7' },
];

interface CheckinForm {
  pet_id:        number | null;
  checkin_date:  string;
  checkout_date: string;
  daily_rate:    number | null;
  food_info:     string;
  medication:    string;
  notes:         string;
}

@Component({
  selector: 'app-hotel',
  templateUrl: './hotel.page.html',
  styleUrls: ['./hotel.page.scss']
})
export class HotelPage implements OnInit {
  stays: any[] = [];
  filteredStays: any[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'active';
  loading: boolean = false;
  currentUser: any;
  userInitials: string = 'AD';

  stats = {
    active: 0, available: 0, checkoutToday: 0,
    checkinToday: 0, monthRevenue: 0, capacity: 7,
  };

  filterOptions = [
    { label: 'Ativos',         value: 'active'   },
    { label: 'Check-out hoje', value: 'checkout' },
    { label: 'Histórico',      value: 'history'  },
  ];

  statusLegend = [
    { label: 'Hospedado',         bg: '#EAF3DE', border: '#1b5e35' },
    { label: 'Saída amanhã',      bg: '#FAEEDA', border: '#854F0B' },
    { label: 'Saída hoje',        bg: '#FCEBEB', border: '#A32D2D' },
    { label: 'Check-in previsto', bg: '#E6F1FB', border: '#185FA5' },
  ];

  // ── Modal check-in ──────────────────────────
  showModal:  boolean = false;
  saving:     boolean = false;
  form:       CheckinForm = this.emptyForm();
  formErrors: any = {};

  petSearch:   string = '';
  petResults:  any[] = [];
  selectedPet: any = null;
  private petSearchTimeout: any;

  // ── Modal checkout ──────────────────────────
  showCheckoutModal: boolean = false;
  checkoutStay: any = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadStays();
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
      if (user?.name) {
        this.userInitials = user.name
          .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
      }
    });
  }

  // ── Carregar stays ──────────────────────────
  loadStays() {
    this.loading = true;
    this.apiService.getHotelStays().subscribe(
      (data: any[]) => {
        this.stays = data.map(s => ({ ...s, urgency: this.calcUrgency(s) }));
        this.calcStats();
        this.applyFilters();
        this.loading = false;
      },
      () => { this.loading = false; }
    );
  }

  // ── Urgência ────────────────────────────────
  calcUrgency(stay: any): 'ok' | 'soon' | 'urgent' | 'incoming' {
    if (stay.status === 'incoming') return 'incoming';
    const today    = new Date(); today.setHours(0,0,0,0);
    const checkout = new Date(stay.checkout_date); checkout.setHours(0,0,0,0);
    const diff     = Math.floor((checkout.getTime() - today.getTime()) / 86400000);
    if (diff <= 0) return 'urgent';
    if (diff === 1) return 'soon';
    return 'ok';
  }

  urgencyLabel(urgency: string): string {
    const map: Record<string, string> = {
      ok: 'Hospedado', soon: 'Check-out amanhã',
      urgent: 'Check-out hoje', incoming: 'Check-in previsto',
    };
    return map[urgency] || 'Hospedado';
  }

  daysRemainingLabel(stay: any): string {
    if (stay.urgency === 'urgent')   return 'Hoje!';
    if (stay.urgency === 'soon')     return 'Amanhã';
    if (stay.urgency === 'incoming') return 'Aguardando';
    const today    = new Date(); today.setHours(0,0,0,0);
    const checkout = new Date(stay.checkout_date); checkout.setHours(0,0,0,0);
    const diff     = Math.floor((checkout.getTime() - today.getTime()) / 86400000);
    return `${diff} dias restantes`;
  }

  // ── KPIs ────────────────────────────────────
  calcStats() {
    const today  = new Date(); today.setHours(0,0,0,0);
    const active = this.stays.filter(s => s.status === 'active').length;
    this.stats = {
      active,
      available: Math.max(0, this.stats.capacity - active),
      checkoutToday: this.stays.filter(s => {
        const d = new Date(s.checkout_date); d.setHours(0,0,0,0);
        return d.getTime() === today.getTime() && s.status === 'active';
      }).length,
      checkinToday: this.stays.filter(s => {
        const d = new Date(s.checkin_date); d.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
      }).length,
      monthRevenue: this.stays
        .filter(s => {
          const d = new Date(s.checkin_date);
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        })
        .reduce((sum, s) => sum + (s.total_value || 0), 0),
      capacity: this.stats.capacity,
    };
  }

  get checkoutTodayNames(): string {
    const today = new Date(); today.setHours(0,0,0,0);
    const names = this.stays
      .filter(s => {
        const d = new Date(s.checkout_date); d.setHours(0,0,0,0);
        return d.getTime() === today.getTime() && s.status === 'active';
      })
      .map(s => s.pet_name);
    return names.join(' e ') || '—';
  }

  // ── Filtros ─────────────────────────────────
  setFilter(value: string) { this.selectedFilter = value; this.applyFilters(); }
  filterStays()            { this.applyFilters(); }

  private applyFilters() {
    let result = [...this.stays];
    switch (this.selectedFilter) {
      case 'active':   result = result.filter(s => s.status === 'active' || s.status === 'incoming'); break;
      case 'checkout': result = result.filter(s => s.urgency === 'urgent' || s.urgency === 'soon'); break;
      case 'history':  result = result.filter(s => s.status === 'completed'); break;
    }
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(s =>
        s.pet_name?.toLowerCase().includes(t) || s.client_name?.toLowerCase().includes(t)
      );
    }
    const order: Record<string, number> = { urgent: 0, soon: 1, incoming: 2, ok: 3 };
    result.sort((a, b) => (order[a.urgency] ?? 4) - (order[b.urgency] ?? 4));
    this.filteredStays = result;
  }

  // ── Modal check-in ──────────────────────────
  openModal() {
    this.formErrors  = {};
    this.petSearch   = '';
    this.petResults  = [];
    this.selectedPet = null;
    this.form        = this.emptyForm();
    this.showModal   = true;
  }

  closeModal() {
    this.showModal   = false;
    this.formErrors  = {};
    this.petSearch   = '';
    this.petResults  = [];
    this.selectedPet = null;
  }

  // Alias para manter compatibilidade com template antigo
  addCheckin() { this.openModal(); }

  // ── Busca de pet ────────────────────────────
  searchPets() {
    clearTimeout(this.petSearchTimeout);
    if (!this.petSearch.trim()) { this.petResults = []; return; }
    this.petSearchTimeout = setTimeout(() => {
      this.apiService.searchPets(this.petSearch).subscribe(
        (data: any[]) => { this.petResults = data.slice(0, 5); },
        () => { this.petResults = []; }
      );
    }, 300);
  }

  selectPet(pet: any) {
    this.selectedPet       = pet;
    this.form.pet_id       = pet.id;
    this.petResults        = [];
    this.petSearch         = '';
    this.formErrors.pet_id = '';
  }

  clearPet() {
    this.selectedPet = null;
    this.form.pet_id = null;
    this.petSearch   = '';
  }

  // ── Cálculo de diárias ──────────────────────
  get totalDays(): number {
    if (!this.form.checkin_date || !this.form.checkout_date) return 0;
    const ci = new Date(this.form.checkin_date);
    const co = new Date(this.form.checkout_date);
    const diff = Math.ceil((co.getTime() - ci.getTime()) / 86400000);
    return diff > 0 ? diff : 0;
  }

  get totalValue(): number {
    return this.totalDays * (this.form.daily_rate || 0);
  }

  calcTotal() { /* reativo via getters */ }

  // ── Validação ───────────────────────────────
  validateField(field: string) {
    this.formErrors[field] = '';
    if (field === 'pet_id'        && !this.form.pet_id)        this.formErrors.pet_id        = 'Selecione o pet';
    if (field === 'checkin_date'  && !this.form.checkin_date)  this.formErrors.checkin_date  = 'Data de check-in obrigatória';
    if (field === 'checkout_date' && !this.form.checkout_date) this.formErrors.checkout_date = 'Data de check-out obrigatória';
    if (field === 'daily_rate'    && !this.form.daily_rate)    this.formErrors.daily_rate    = 'Informe o valor por diária';
    if (field === 'checkout_date' && this.form.checkin_date && this.form.checkout_date) {
      if (new Date(this.form.checkout_date) <= new Date(this.form.checkin_date)) {
        this.formErrors.checkout_date = 'Check-out deve ser após o check-in';
      }
    }
  }

  private validateAll(): boolean {
    ['pet_id','checkin_date','checkout_date','daily_rate'].forEach(f => this.validateField(f));
    return !Object.values(this.formErrors).some(e => !!e);
  }

  // ── Salvar check-in ──────────────────────────
  async saveCheckin() {
    if (!this.validateAll()) return;
    this.saving = true;

    const payload = {
      ...this.form,
      total_days:  this.totalDays,
      total_value: this.totalValue,
    };

    this.apiService.createHotelStay(payload).subscribe(
      () => {
        this.saving = false;
        this.closeModal();
        this.loadStays();
        this.showToast('Check-in registrado com sucesso!');
      },
      () => { this.saving = false; this.showToast('Erro ao registrar check-in'); }
    );
  }

  // ── Modal checkout ───────────────────────────
  confirmCheckout(stay: any) {
    this.checkoutStay      = stay;
    this.showCheckoutModal = true;
  }

  closeCheckoutModal() {
    this.showCheckoutModal = false;
    this.checkoutStay      = null;
  }

  async doCheckout() {
    if (!this.checkoutStay) return;
    this.saving = true;
    this.apiService.checkoutHotelStay(this.checkoutStay.id).subscribe(
      () => {
        this.saving = false;
        this.closeCheckoutModal();
        this.loadStays();
        this.showToast(`${this.checkoutStay?.pet_name} fez check-out!`);
      },
      () => { this.saving = false; this.showToast('Erro ao registrar saída'); }
    );
  }

  // Mantendo alias do método antigo
  async checkout(stay: any) { this.confirmCheckout(stay); }

  viewStay(stay: any) { this.router.navigate(['/hotel', stay.id]); }

  // ── Avatar helpers ───────────────────────────
  private getPalette(stay: any) {
    const i = this.stays.indexOf(stay) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[i >= 0 ? i : 0];
  }
  getAvatarBg(stay: any)    { return this.getPalette(stay).bg; }
  getAvatarColor(stay: any) { return this.getPalette(stay).color; }

  // ── Helpers ──────────────────────────────────
  private emptyForm(): CheckinForm {
    return {
      pet_id: null,
      checkin_date:  new Date().toISOString().split('T')[0],
      checkout_date: '',
      daily_rate:    null,
      food_info:     '',
      medication:    '',
      notes:         '',
    };
  }

  async showToast(message: string) {
    const t = await this.toastController.create({
      message, duration: 2000, position: 'bottom', color: 'success'
    });
    await t.present();
  }

  goBack() { this.router.navigate(['/dashboard']); }
}