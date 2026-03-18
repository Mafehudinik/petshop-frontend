import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastController } from '@ionic/angular';

interface ServiceForm {
  name:        string;
  description: string;
  price:       number | null;
  duration:    number | null;
  active:      boolean;
}

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss']
})
export class ServicesPage implements OnInit {
  services: any[] = [];
  filteredServices: any[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  saving: boolean = false;
  currentUser: any = null;
  userInitials: string = 'AD';

  // ── Modal serviço ───────────────────────────
  showModal:  boolean = false;
  isEditing:  boolean = false;
  editingId:  number | null = null;
  form:       ServiceForm = this.emptyForm();
  formErrors: any = {};

  // ── Modal exclusão ──────────────────────────
  showDeleteModal: boolean = false;
  deletingService: any = null;

  // Presets de duração
  durationPresets = [
    { label: '30m',  value: 30  },
    { label: '1h',   value: 60  },
    { label: '1h30', value: 90  },
    { label: '2h',   value: 120 },
  ];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadServices();
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.userInitials = this.currentUser.name?.substring(0, 2).toUpperCase() || 'AD';
    }
  }

  // ── Carregar serviços ───────────────────────
  loadServices() {
    this.loading = true;
    this.apiService.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.filteredServices = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterServices() {
    const term = this.searchTerm.toLowerCase();
    this.filteredServices = this.services.filter(s =>
      s.name?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  }

  // ── Modal serviço ───────────────────────────
  openModal(service?: any) {
    this.formErrors = {};
    if (service) {
      this.isEditing = true;
      this.editingId = service.id;
      this.form = {
        name:        service.name        || '',
        description: service.description || '',
        price:       service.price       ?? null,
        duration:    service.duration    ?? null,
        active:      service.active !== undefined ? !!service.active : true,
      };
    } else {
      this.isEditing = false;
      this.editingId = null;
      this.form = this.emptyForm();
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.formErrors = {}; }

  // Aliases para retrocompatibilidade
  addService()            { this.openModal(); }
  editService(s: any)     { this.openModal(s); }

  setDuration(minutes: number) {
    this.form.duration = minutes;
    this.formErrors.duration = '';
  }

  validateField(field: string) {
    this.formErrors[field] = '';
    if (field === 'name'     && !this.form.name?.trim()) this.formErrors.name     = 'Nome é obrigatório';
    if (field === 'price'    && !this.form.price)        this.formErrors.price    = 'Preço é obrigatório';
    if (field === 'duration' && !this.form.duration)     this.formErrors.duration = 'Duração é obrigatória';
  }

  private validateAll(): boolean {
    ['name', 'price', 'duration'].forEach(f => this.validateField(f));
    return !Object.values(this.formErrors).some(e => !!e);
  }

  async saveService() {
    if (!this.validateAll()) return;
    this.saving = true;

    const payload = { ...this.form, active: this.form.active ? 1 : 0 };

    const req$ = this.isEditing
      ? this.apiService.updateService(this.editingId!, payload)
      : this.apiService.createService(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadServices();
        this.showToast(this.isEditing ? 'Serviço atualizado!' : 'Serviço cadastrado!');
      },
      error: () => { this.saving = false; this.showToast('Erro ao salvar serviço'); }
    });
  }

  // ── Modal exclusão ──────────────────────────
  confirmDelete(service: any) {
    this.deletingService  = service;
    this.showDeleteModal  = true;
  }

  closeDeleteModal() { this.showDeleteModal = false; this.deletingService = null; }

  // Alias retrocompatibilidade
  deleteService(id: number) {
    const service = this.services.find(s => s.id === id);
    if (service) this.confirmDelete(service);
  }

  async doDelete() {
    if (!this.deletingService) return;
    this.saving = true;
    this.apiService.deleteService(this.deletingService.id).subscribe({
      next: () => {
        this.saving = false;
        this.closeDeleteModal();
        this.loadServices();
        this.showToast('Serviço removido!');
      },
      error: () => { this.saving = false; this.showToast('Erro ao remover serviço'); }
    });
  }

  // ── Helper de duração ────────────────────────
  formatDuration(minutes: number): string {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins  = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  private emptyForm(): ServiceForm {
    return { name: '', description: '', price: null, duration: 60, active: true };
  }

  async showToast(message: string) {
    const t = await this.toastController.create({
      message, duration: 2000, position: 'bottom', color: 'success'
    });
    await t.present();
  }

  navigateTo(page: string) { this.router.navigate([`/${page}`]); }
}