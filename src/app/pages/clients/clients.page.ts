import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';

// Paleta de avatares — cicla pelo índice do cliente
const AVATAR_PALETTES = [
  { bg: '#EAF3DE', color: '#1b5e35' },
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#FBEAF0', color: '#993556' },
  { bg: '#EEEDFE', color: '#534AB7' },
];

interface ClientForm {
  name:         string;
  cpf:          string;
  birthdate:    string;
  phone:        string;
  whatsapp:     string;
  email:        string;
  street:       string;
  number:       string;
  neighborhood: string;
  city:         string;
  notes:        string;
}

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss']
})
export class ClientsPage implements OnInit {
  clients: any[] = [];
  filteredClients: any[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  currentUser: any;
  userInitials: string = 'AD';

  // Paginação
  pageSize: number = 10;
  currentPage: number = 1;

  // ── Modal ──────────────────────────────────
  showModal:  boolean = false;
  isEditing:  boolean = false;
  saving:     boolean = false;
  editingId:  number | null = null;
  form:       ClientForm = this.emptyForm();
  formErrors: any = {};

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadClients();
    this.authService.currentUser.subscribe((user: any) => {
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

  // ── Carregar clientes ───────────────────────
  loadClients() {
    this.loading = true;
    this.apiService.getClients().subscribe(
      (data: any[]) => {
        this.clients = data;
        this.filteredClients = data;
        this.currentPage = 1;
        this.loading = false;
      },
      (error: any) => {
        console.error('Erro ao carregar clientes:', error);
        this.loading = false;
      }
    );
  }

  // ── Filtro ──────────────────────────────────
  filterClients() {
    this.currentPage = 1;
    if (!this.searchTerm) {
      this.filteredClients = this.clients;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(c =>
      c.name?.toLowerCase().includes(term) ||
      c.phone?.includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  }

  // ── Paginação ───────────────────────────────
  get paginatedClients(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClients.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredClients.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pageStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredClients.length);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ── Avatar helpers ──────────────────────────
  getInitials(name: string): string {
    if (!name) return '?';
    return name.trim().split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private getPalette(client: any): { bg: string; color: string } {
    const index = this.clients.indexOf(client) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index >= 0 ? index : 0];
  }

  getAvatarBg(client: any): string    { return this.getPalette(client).bg; }
  getAvatarColor(client: any): string { return this.getPalette(client).color; }

  // ── Abrir / fechar modal ────────────────────
  openModal(client?: any) {
    this.formErrors = {};

    if (client) {
      // Modo edição — preenche com dados existentes
      this.isEditing = true;
      this.editingId = client.id;
      this.form = {
        name:         client.name         || '',
        cpf:          client.cpf          || '',
        birthdate:    client.birthdate    || '',
        phone:        client.phone        || '',
        whatsapp:     client.whatsapp     || '',
        email:        client.email        || '',
        street:       client.street       || '',
        number:       client.number       || '',
        neighborhood: client.neighborhood || '',
        city:         client.city         || '',
        notes:        client.notes        || '',
      };
    } else {
      // Modo criação — form em branco
      this.isEditing = false;
      this.editingId = null;
      this.form = this.emptyForm();
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal  = false;
    this.formErrors = {};
  }

  // ── Validação ───────────────────────────────
  validateField(field: string) {
    this.formErrors[field] = '';

    if (field === 'name' && !this.form.name.trim()) {
      this.formErrors.name = 'Nome é obrigatório';
    }
    if (field === 'phone' && !this.form.phone.trim()) {
      this.formErrors.phone = 'Telefone é obrigatório';
    }
    if (field === 'email' && this.form.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.email)) {
        this.formErrors.email = 'E-mail inválido';
      }
    }
  }

  private validateAll(): boolean {
    this.validateField('name');
    this.validateField('phone');
    if (this.form.email) this.validateField('email');
    return !Object.values(this.formErrors).some(e => !!e);
  }

  // ── Salvar ──────────────────────────────────
  async saveClient() {
    if (!this.validateAll()) return;

    this.saving = true;

    const payload = { ...this.form };

    const request$ = this.isEditing
      ? this.apiService.updateClient(this.editingId!, payload)
      : this.apiService.createClient(payload);

    request$.subscribe(
      () => {
        this.saving = false;
        this.closeModal();
        this.loadClients();
        this.showToast(this.isEditing ? 'Cliente atualizado!' : 'Cliente cadastrado com sucesso!');
      },
      () => {
        this.saving = false;
        this.showToast('Erro ao salvar cliente');
      }
    );
  }

  // ── Navegar para detalhe ────────────────────
  viewClient(client: any) {
    this.router.navigate(['/clients', client.id]);
  }

  // ── Helpers ─────────────────────────────────
  private emptyForm(): ClientForm {
    return {
      name: '', cpf: '', birthdate: '',
      phone: '', whatsapp: '', email: '',
      street: '', number: '', neighborhood: '', city: '',
      notes: '',
    };
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}