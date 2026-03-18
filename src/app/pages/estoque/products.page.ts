import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';

interface ProductForm {
  name:       string;
  reference:  string;
  category:   string;
  stock:      number | null;
  min_stock:  number | null;
  cost_price: number | null;
  sale_price: number | null;
  is_service: boolean;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss']
})
export class ProductsPage implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  selectedStockFilter: string = 'all';
  selectedCategory: string = '';
  loading: boolean = false;
  saving: boolean = false;
  currentUser: any;
  userInitials: string = 'AD';

  sortField: string = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  pageSize: number = 15;
  currentPage: number = 1;

  stats = { total: 0, critical: 0, low: 0, totalValue: 0, categories: 0 };

  stockFilters = [
    { label: 'Todos',     value: 'all',      style: '' },
    { label: '⚠ Crítico', value: 'critical', style: 'critical-btn' },
    { label: 'Baixo',     value: 'low',      style: 'low-btn' },
    { label: 'Normal',    value: 'normal',   style: '' },
  ];

  categories = [
    { label: 'Ração',        value: 'food'        },
    { label: 'Acessório',    value: 'accessories' },
    { label: 'Higiene',      value: 'hygiene'     },
    { label: 'Medicamento',  value: 'medicine'    },
    { label: 'Serviço',      value: 'service'     },
    { label: 'Outro',        value: 'other'       },
  ];

  private CATEGORY_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
    medicine:    { icon: 'medical-outline',    bg: '#EEEDFE', color: '#534AB7' },
    hygiene:     { icon: 'water-outline',      bg: '#FBEAF0', color: '#993556' },
    accessories: { icon: 'cart-outline',       bg: '#FAEEDA', color: '#854F0B' },
    food:        { icon: 'restaurant-outline', bg: '#E6F1FB', color: '#185FA5' },
    service:     { icon: 'heart-outline',      bg: '#EAF3DE', color: '#1b5e35' },
    other:       { icon: 'cube-outline',       bg: '#f5f7f5', color: '#888'    },
  };

  // ── Modal novo/editar produto ───────────────
  showProductModal: boolean = false;
  isEditing:        boolean = false;
  editingId:        number | null = null;
  form:             ProductForm = this.emptyForm();
  formErrors:       any = {};

  // ── Modal reposição ──────────────────────────
  showRestockModal: boolean = false;
  restockProduct:   any = null;
  restockQty:       number = 1;
  restockNote:      string = '';
  restockError:     string = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
      if (user?.name) {
        this.userInitials = user.name
          .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
      }
    });
  }

  // ── Carregar produtos ───────────────────────
  loadProducts() {
    this.loading = true;
    this.apiService.getProducts().subscribe(
      (data: any[]) => {
        this.products = data;
        this.calcStats();
        this.applyFilters();
        this.loading = false;
      },
      () => { this.loading = false; }
    );
  }

  // ── KPIs ────────────────────────────────────
  calcStats() {
    const cats = new Set(this.products.map(p => p.category));
    this.stats = {
      total:      this.products.length,
      critical:   this.products.filter(p => !p.is_service && p.stock <= 2).length,
      low:        this.products.filter(p => !p.is_service && p.stock > 2 && p.stock < p.min_stock).length,
      totalValue: this.products.reduce((s, p) => s + (p.cost_price || 0) * (p.stock || 0), 0),
      categories: cats.size,
    };
  }

  // ── Classificação de estoque ─────────────────
  stockClass(product: any): string {
    if (product.is_service || product.category === 'service') return 'service';
    if (product.stock <= 2)               return 'critical';
    if (product.stock < product.min_stock) return 'low';
    return 'normal';
  }

  stockLabel(product: any): string {
    if (product.is_service || product.category === 'service') return 'Ativo';
    return { critical: 'Crítico', low: 'Baixo', normal: 'Normal' }[this.stockClass(product)] || 'Normal';
  }

  rowClass(product: any): string {
    const c = this.stockClass(product);
    if (c === 'critical') return 'critical-row';
    if (c === 'low')      return 'low-row';
    return '';
  }

  // ── Filtros + ordenação ──────────────────────
  setStockFilter(value: string) {
    this.selectedStockFilter = value; this.currentPage = 1; this.applyFilters();
  }

  applyFilters() {
    let result = [...this.products];
    switch (this.selectedStockFilter) {
      case 'critical': result = result.filter(p => !p.is_service && p.stock <= 2); break;
      case 'low':      result = result.filter(p => !p.is_service && p.stock > 2 && p.stock < p.min_stock); break;
      case 'normal':   result = result.filter(p => p.is_service || p.stock >= p.min_stock); break;
    }
    if (this.selectedCategory) result = result.filter(p => p.category === this.selectedCategory);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(p => p.name?.toLowerCase().includes(t) || p.reference?.toLowerCase().includes(t));
    }
    result.sort((a, b) => {
      const av = a[this.sortField] ?? '', bv = b[this.sortField] ?? '';
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : (av as number) - (bv as number);
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
    this.filteredProducts = result;
  }

  sort(field: string) {
    this.sortDir = this.sortField === field ? (this.sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    this.sortField = field;
    this.applyFilters();
  }
  sortIcon(field: string): string {
    if (this.sortField !== field) return 'swap-vertical-outline';
    return this.sortDir === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline';
  }

  // ── Paginação ───────────────────────────────
  get paginatedProducts(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }
  get totalPages(): number { return Math.ceil(this.filteredProducts.length / this.pageSize); }
  get pages(): number[]    { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageStart(): number  { return (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd(): number    { return Math.min(this.currentPage * this.pageSize, this.filteredProducts.length); }
  goToPage(page: number)   { if (page >= 1 && page <= this.totalPages) this.currentPage = page; }

  // ── Helpers de categoria ─────────────────────
  getCategoryStyle(cat: string): object {
    const c = this.CATEGORY_ICONS[cat] || this.CATEGORY_ICONS['other'];
    return { background: c.bg, color: c.color };
  }
  getCategoryIcon(cat: string): string  { return (this.CATEGORY_ICONS[cat] || this.CATEGORY_ICONS['other']).icon; }
  getCategoryColor(cat: string): string { return (this.CATEGORY_ICONS[cat] || this.CATEGORY_ICONS['other']).color; }
  categoryLabel(cat: string): string    { return this.categories.find(c => c.value === cat)?.label || cat; }

  // ── Modal novo/editar produto ────────────────
  openProductModal(product?: any) {
    this.formErrors = {};
    if (product) {
      this.isEditing = true;
      this.editingId = product.id;
      this.form = {
        name:       product.name       || '',
        reference:  product.reference  || '',
        category:   product.category   || '',
        stock:      product.stock      ?? null,
        min_stock:  product.min_stock  ?? null,
        cost_price: product.cost_price ?? null,
        sale_price: product.sale_price ?? null,
        is_service: product.is_service || product.category === 'service',
      };
    } else {
      this.isEditing = false;
      this.editingId = null;
      this.form = this.emptyForm();
    }
    this.showProductModal = true;
  }

  closeProductModal() { this.showProductModal = false; this.formErrors = {}; }

  // Alias para retrocompatibilidade
  addProduct()              { this.openProductModal(); }
  editProduct(p: any)       { this.openProductModal(p); }

  validateField(field: string) {
    this.formErrors[field] = '';
    if (field === 'name'       && !this.form.name?.trim())  this.formErrors.name       = 'Nome é obrigatório';
    if (field === 'category'   && !this.form.category)      this.formErrors.category   = 'Selecione uma categoria';
    if (field === 'sale_price' && !this.form.sale_price)    this.formErrors.sale_price = 'Preço é obrigatório';
  }

  private validateAll(): boolean {
    ['name', 'category', 'sale_price'].forEach(f => this.validateField(f));
    return !Object.values(this.formErrors).some(e => !!e);
  }

  async saveProduct() {
    if (!this.validateAll()) return;
    this.saving = true;

    const payload = {
      ...this.form,
      is_service: this.form.category === 'service',
    };

    const req$ = this.isEditing
      ? this.apiService.updateProduct(this.editingId!, payload)
      : this.apiService.createProduct(payload);

    req$.subscribe(
      () => {
        this.saving = false;
        this.closeProductModal();
        this.loadProducts();
        this.showToast(this.isEditing ? 'Produto atualizado!' : 'Produto cadastrado!');
      },
      () => { this.saving = false; this.showToast('Erro ao salvar produto'); }
    );
  }

  // ── Modal reposição ──────────────────────────
  openRestockModal(product: any) {
    this.restockProduct = product;
    this.restockQty     = 1;
    this.restockNote    = '';
    this.restockError   = '';
    this.showRestockModal = true;
  }

  closeRestockModal() { this.showRestockModal = false; this.restockProduct = null; }

  // Alias retrocompatibilidade
  restock(product: any) { this.openRestockModal(product); }

  increaseRestockQty() { this.restockQty++; this.restockError = ''; }
  decreaseRestockQty() {
    if (this.restockQty > 1) { this.restockQty--; }
  }
  validateRestockQty() {
    this.restockError = this.restockQty < 1 ? 'Quantidade deve ser maior que zero' : '';
  }

  async confirmRestock() {
    if (this.restockQty < 1) { this.restockError = 'Quantidade deve ser maior que zero'; return; }
    this.saving = true;
    this.apiService.restockProduct(this.restockProduct.id, this.restockQty).subscribe(
      () => {
        this.saving = false;
        this.closeRestockModal();
        this.loadProducts();
        this.showToast('Estoque atualizado com sucesso!');
      },
      () => { this.saving = false; this.showToast('Erro ao atualizar estoque'); }
    );
  }

  // ── Exportar CSV ─────────────────────────────
  exportCSV() {
    const headers = ['Nome', 'Referência', 'Categoria', 'Estoque', 'Mínimo', 'Custo', 'Preço Venda'];
    const rows = this.filteredProducts.map(p => [
      p.name, p.reference, p.category,
      p.is_service ? '—' : p.stock,
      p.is_service ? '—' : p.min_stock,
      p.is_service ? '—' : p.cost_price,
      p.sale_price,
    ]);
    const csv  = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'estoque_rabichos.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  viewProduct(product: any) { this.router.navigate(['/products', product.id]); }

  private emptyForm(): ProductForm {
    return { name: '', reference: '', category: '', stock: null,
             min_stock: null, cost_price: null, sale_price: null, is_service: false };
  }

  async showToast(message: string) {
    const t = await this.toastController.create({
      message, duration: 2000, position: 'bottom', color: 'success'
    });
    await t.present();
  }

  goBack() { this.router.navigate(['/dashboard']); }
}