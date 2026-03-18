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

interface PetForm {
  name:      string;
  species:   string;
  breed:     string;
  sex:       string;
  age:       string;
  weight:    number | null;
  coat:      string;
  allergies: string;
  notes:     string;
  client_id: number | null;
}

@Component({
  selector: 'app-pets',
  templateUrl: './pets.page.html',
  styleUrls: ['./pets.page.scss']
})
export class PetsPage implements OnInit {
  pets: any[] = [];
  filteredPets: any[] = [];
  searchTerm: string = '';
  selectedSpecies: string = 'todos';
  loading: boolean = false;
  currentUser: any;
  userInitials: string = 'AD';

  // Opções de espécie para filtro e modal
  speciesOptions = [
    { label: 'Todos',  value: 'todos', icon: 'paw-outline'    },
    { label: 'Cão',    value: 'cao',   icon: 'paw-outline'    },
    { label: 'Gato',   value: 'gato',  icon: 'paw-outline'    },
    { label: 'Outro',  value: 'outro', icon: 'ellipse-outline' },
  ];

  // Paginação
  pageSize: number = 12;
  currentPage: number = 1;

  // ── Modal ──────────────────────────────────
  showModal:  boolean = false;
  isEditing:  boolean = false;
  saving:     boolean = false;
  editingId:  number | null = null;
  form:       PetForm = this.emptyForm();
  formErrors: any = {};

  // Busca de tutor
  clientSearch:  string = '';
  clientResults: any[] = [];
  selectedClient: any = null;
  private clientSearchTimeout: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadPets();
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
      if (user?.name) {
        this.userInitials = user.name
          .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
      }
    });
  }

  // ── Carregar pets ───────────────────────────
  loadPets() {
    this.loading = true;
    this.apiService.getPets().subscribe(
      (data: any[]) => {
        this.pets = data;
        this.applyFilters();
        this.loading = false;
      },
      (error: any) => {
        console.error('Erro ao carregar pets:', error);
        this.loading = false;
      }
    );
  }

  // ── Filtros ─────────────────────────────────
  filterPets() {
    this.currentPage = 1;
    this.applyFilters();
  }

  filterBySpecies(species: string) {
    this.selectedSpecies = species;
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters() {
    let result = [...this.pets];
    if (this.selectedSpecies !== 'todos') {
      result = result.filter(p => (p.species || '').toLowerCase() === this.selectedSpecies);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.breed?.toLowerCase().includes(term) ||
        p.client_name?.toLowerCase().includes(term)
      );
    }
    this.filteredPets = result;
  }

  // ── Paginação ───────────────────────────────
  get paginatedPets(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPets.slice(start, start + this.pageSize);
  }
  get totalPages(): number { return Math.ceil(this.filteredPets.length / this.pageSize); }
  get pages(): number[]    { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageStart(): number  { return (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd(): number    { return Math.min(this.currentPage * this.pageSize, this.filteredPets.length); }
  goToPage(page: number)   { if (page >= 1 && page <= this.totalPages) this.currentPage = page; }

  // ── Avatar helpers ──────────────────────────
  private getPalette(pet: any): { bg: string; color: string } {
    const index = this.pets.indexOf(pet) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index >= 0 ? index : 0];
  }
  getAvatarBg(pet: any): string    { return this.getPalette(pet).bg; }
  getAvatarColor(pet: any): string { return this.getPalette(pet).color; }
  getInitials(name: string): string {
    if (!name) return '?';
    return name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  speciesLabel(species: string): string {
    const map: Record<string, string> = { cao: 'Cão', cachorro: 'Cão', gato: 'Gato', outro: 'Outro' };
    return map[(species || '').toLowerCase()] || 'Pet';
  }

  // ── Abrir / fechar modal ────────────────────
  openModal(pet?: any) {
    this.formErrors    = {};
    this.clientSearch  = '';
    this.clientResults = [];

    if (pet) {
      this.isEditing = true;
      this.editingId = pet.id;
      this.form = {
        name:      pet.name      || '',
        species:   pet.species   || '',
        breed:     pet.breed     || '',
        sex:       pet.sex       || '',
        age:       pet.age       || '',
        weight:    pet.weight    || null,
        coat:      pet.coat      || '',
        allergies: pet.allergies || '',
        notes:     pet.notes     || '',
        client_id: pet.client_id || null,
      };
      // Pré-seleciona o tutor se vier nos dados
      this.selectedClient = pet.client_id
        ? { id: pet.client_id, name: pet.client_name, phone: pet.client_phone }
        : null;
    } else {
      this.isEditing      = false;
      this.editingId      = null;
      this.selectedClient = null;
      this.form           = this.emptyForm();
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal     = false;
    this.formErrors    = {};
    this.clientSearch  = '';
    this.clientResults = [];
    this.selectedClient = null;
  }

  // ── Busca de tutor ──────────────────────────
  searchClients() {
    clearTimeout(this.clientSearchTimeout);
    if (!this.clientSearch.trim()) { this.clientResults = []; return; }

    this.clientSearchTimeout = setTimeout(() => {
      this.apiService.searchClients(this.clientSearch).subscribe(
        (data: any[]) => { this.clientResults = data.slice(0, 5); },
        () => { this.clientResults = []; }
      );
    }, 300);
  }

  selectClient(client: any) {
    this.selectedClient  = client;
    this.form.client_id  = client.id;
    this.clientResults   = [];
    this.clientSearch    = '';
    this.formErrors.client_id = '';
  }

  clearClient() {
    this.selectedClient = null;
    this.form.client_id = null;
    this.clientSearch   = '';
  }

  // ── Validação ───────────────────────────────
  validateField(field: string) {
    this.formErrors[field] = '';
    if (field === 'name'      && !this.form.name.trim())    this.formErrors.name      = 'Nome é obrigatório';
    if (field === 'species'   && !this.form.species)        this.formErrors.species   = 'Selecione a espécie';
    if (field === 'sex'       && !this.form.sex)            this.formErrors.sex       = 'Selecione o sexo';
    if (field === 'client_id' && !this.form.client_id)      this.formErrors.client_id = 'Selecione o tutor';
  }

  private validateAll(): boolean {
    ['name', 'species', 'sex', 'client_id'].forEach(f => this.validateField(f));
    return !Object.values(this.formErrors).some(e => !!e);
  }

  // ── Salvar pet ──────────────────────────────
  async savePet() {
    if (!this.validateAll()) return;
    this.saving = true;

    const payload = { ...this.form };

    const request$ = this.isEditing
      ? this.apiService.updatePet(this.editingId!, payload)
      : this.apiService.createPet(payload);

    request$.subscribe(
      () => {
        this.saving = false;
        this.closeModal();
        this.loadPets();
        this.showToast(this.isEditing ? 'Pet atualizado!' : 'Pet cadastrado com sucesso!');
      },
      () => {
        this.saving = false;
        this.showToast('Erro ao salvar pet');
      }
    );
  }

  // ── Navegar ─────────────────────────────────
  viewPet(pet: any) {
    this.router.navigate(['/pets', pet.id]);
  }

  viewHistory(event: Event, pet: any) {
    event.stopPropagation();
    this.router.navigate(['/pets', pet.id, 'history']);
  }

  // ── Helpers ─────────────────────────────────
  private emptyForm(): PetForm {
    return { name: '', species: '', breed: '', sex: '', age: '',
             weight: null, coat: '', allergies: '', notes: '', client_id: null };
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message, duration: 2000, position: 'bottom', color: 'success'
    });
    await toast.present();
  }

  goBack() { this.router.navigate(['/dashboard']); }
}