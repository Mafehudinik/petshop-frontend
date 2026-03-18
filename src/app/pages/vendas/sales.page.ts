import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastController, ModalController } from '@ionic/angular';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  type: 'product' | 'service';
  stock: number | null;
}

export interface CatalogItem {
  id: number;
  name: string;
  price: number;
  category: string;
  type: 'product' | 'service';
  stock: number | null;
  icon: string;
  iconBg: string;
  iconColor: string;
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss']
})
export class SalesPage implements OnInit {
  catalog: CatalogItem[] = [];
  filteredProducts: CatalogItem[] = [];
  cart: CartItem[] = [];
  selectedClient: any = null;
  selectedCategory: string = 'all';
  selectedPayment: string = 'cash';
  searchTerm: string = '';
  discountPct: number = 0;
  loading: boolean = false;
  currentUser: any;
  userInitials: string = 'AD';
  today: string = '';

  categories = [
    { label: 'Todos',        value: 'all'         },
    { label: 'Serviços',     value: 'service'     },
    { label: 'Rações',       value: 'food'        },
    { label: 'Acessórios',   value: 'accessories' },
    { label: 'Higiene',      value: 'hygiene'     },
    { label: 'Medicamentos', value: 'medicine'    },
  ];

  paymentMethods = [
    { label: 'Dinheiro', value: 'cash'   },
    { label: 'Cartão',   value: 'card'   },
    { label: 'Pix',      value: 'pix'    },
    { label: 'Fiado',    value: 'credit' },
  ];

  // Ícones por categoria
  private ICONS: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
    service:     { icon: 'heart-outline',       iconBg: '#EAF3DE', iconColor: '#1b5e35' },
    food:        { icon: 'restaurant-outline',  iconBg: '#E6F1FB', iconColor: '#185FA5' },
    accessories: { icon: 'cart-outline',        iconBg: '#FAEEDA', iconColor: '#854F0B' },
    hygiene:     { icon: 'water-outline',       iconBg: '#FBEAF0', iconColor: '#993556' },
    medicine:    { icon: 'medical-outline',     iconBg: '#EEEDFE', iconColor: '#534AB7' },
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.today = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    this.loadCatalog();
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
      if (user?.name) {
        this.userInitials = user.name
          .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
      }
    });
  }

  loadCatalog() {
    this.loading = true;
    this.apiService.getCatalog().subscribe(
      (data: any[]) => {
        this.catalog = data.map(item => ({
          ...item,
          ...(this.ICONS[item.category] || this.ICONS['service'])
        }));
        this.applyFilters();
        this.loading = false;
      },
      () => { this.loading = false; }
    );
  }

  // ── Filtros ─────────────────────────────────
  selectCategory(value: string) {
    this.selectedCategory = value;
    this.applyFilters();
  }

  filterProducts() { this.applyFilters(); }

  private applyFilters() {
    let result = [...this.catalog];

    if (this.selectedCategory !== 'all') {
      result = result.filter(p => p.category === this.selectedCategory);
    }
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(t));
    }

    this.filteredProducts = result;
  }

  // ── Carrinho ────────────────────────────────
  addToCart(item: CatalogItem) {
    const existing = this.cart.find(c => c.id === item.id);
    if (existing) {
      if (item.stock !== null && existing.qty >= item.stock) {
        this.showToast(`Estoque insuficiente para ${item.name}`);
        return;
      }
      existing.qty++;
    } else {
      this.cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: 1,
        type: item.type,
        stock: item.stock,
      });
    }
  }

  increaseQty(item: CartItem) {
    if (item.stock !== null && item.qty >= item.stock) {
      this.showToast('Estoque insuficiente');
      return;
    }
    item.qty++;
  }

  decreaseQty(item: CartItem) {
    if (item.qty <= 1) {
      this.cart = this.cart.filter(c => c.id !== item.id);
    } else {
      item.qty--;
    }
  }

  // ── Cálculos ────────────────────────────────
  get subtotal(): number {
    return this.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  get discountAmount(): number {
    return this.subtotal * (this.discountPct / 100);
  }

  get total(): number {
    return this.subtotal - this.discountAmount;
  }

  calcTotal() {
    // força recalculo (chamado pelo (change) do input de desconto)
    if (this.discountPct < 0) this.discountPct = 0;
    if (this.discountPct > 100) this.discountPct = 100;
  }

  // ── Pagamento ───────────────────────────────
  selectPayment(method: string) {
    this.selectedPayment = method;
  }

  // ── Cliente (busca inline no carrinho) ──────────
  clientSearch:   string = '';
  clientResults:  any[] = [];
  showClientSearch: boolean = false;
  private clientSearchTimeout: any;

  selectClient() {
    this.showClientSearch = true;
    this.clientSearch     = '';
    this.clientResults    = [];
  }

  searchClientsInline() {
    clearTimeout(this.clientSearchTimeout);
    if (!this.clientSearch.trim()) { this.clientResults = []; return; }
    this.clientSearchTimeout = setTimeout(() => {
      this.apiService.searchClients(this.clientSearch).subscribe(
        (results: any[]) => { this.clientResults = results.slice(0, 5); },
        () => { this.clientResults = []; }
      );
    }, 300);
  }

  pickClient(client: any) {
    this.selectedClient    = client;
    this.showClientSearch  = false;
    this.clientResults     = [];
    this.clientSearch      = '';
  }

  cancelClientSearch() {
    this.showClientSearch = false;
    this.clientResults    = [];
    this.clientSearch     = '';
  }

  clearClient() { this.selectedClient = null; }

  // ── Confirmação de venda (modal nativo) ──────────
  showConfirmSaleModal: boolean = false;

  finalizeSale() {
    if (this.cart.length === 0) return;
    this.showConfirmSaleModal = true;
  }

  closeConfirmSaleModal() { this.showConfirmSaleModal = false; }

  doFinalizeSale() {
    const saleData = {
      client_id:       this.selectedClient?.id || null,
      items:           this.cart.map(i => ({ product_id: i.id, qty: i.qty, unit_price: i.price })),
      subtotal:        this.subtotal,
      discount_pct:    this.discountPct,
      discount_amount: this.discountAmount,
      total:           this.total,
      payment_method:  this.selectedPayment,
    };
    this.saving = true;
    this.apiService.createSale(saleData).subscribe(
      () => {
        this.saving = false;
        this.closeConfirmSaleModal();
        this.showToast('Venda finalizada com sucesso!');
        this.cart = []; this.selectedClient = null;
        this.discountPct = 0; this.selectedPayment = 'cash';
      },
      () => { this.saving = false; this.showToast('Erro ao finalizar venda'); }
    );
  }

  // ── Cancelar venda (modal nativo) ────────────────
  showCancelSaleModal: boolean = false;

  cancelSale() {
    if (this.cart.length === 0) return;
    this.showCancelSaleModal = true;
  }

  closeCancelSaleModal() { this.showCancelSaleModal = false; }

  doCancelSale() {
    this.cart = []; this.selectedClient = null; this.discountPct = 0;
    this.closeCancelSaleModal();
  }

  // ── Modal fechamento de caixa ─────────────────
  showCloseRegisterModal: boolean = false;
  saving: boolean = false;

  registerForm = {
    opening_balance: null as number | null,
    closing_balance: null as number | null,
    notes: '',
  };

  registerStats = {
    total: 0,
    count: 0,
    avgTicket: 0,
    byPayment: [] as any[],
  };

  get registerDiff(): number {
    if (!this.registerForm.closing_balance && !this.registerForm.opening_balance) return 0;
    const expected = (this.registerForm.opening_balance || 0) +
      (this.registerStats.byPayment.find(p => p.value === 'cash')?.amount || 0);
    return (this.registerForm.closing_balance || 0) - expected;
  }

  get registerDiffClass(): string {
    const d = this.registerDiff;
    if (d === 0) return 'ok';
    if (Math.abs(d) <= 10) return 'warning';
    return 'danger';
  }

  calcRegisterDiff() { /* reactivo via getter */ }

  openCloseRegisterModal() {
    // Calcula stats do dia a partir das vendas já carregadas
    const today = new Date().toISOString().split('T')[0];
    // Aqui você pode filtrar vendas do dia se tiver o array — por ora usamos dados mockados
    this.registerStats = {
      total: 0,
      count: 0,
      avgTicket: 0,
      byPayment: [
        { label: 'Dinheiro', value: 'cash',   icon: 'cash-outline',       bg: '#EAF3DE', color: '#1b5e35', count: 0, amount: 0, pct: 0 },
        { label: 'Cartão',   value: 'card',   icon: 'card-outline',       bg: '#E6F1FB', color: '#185FA5', count: 0, amount: 0, pct: 0 },
        { label: 'Pix',      value: 'pix',    icon: 'flash-outline',      bg: '#EEEDFE', color: '#534AB7', count: 0, amount: 0, pct: 0 },
        { label: 'Fiado',    value: 'credit', icon: 'document-outline',   bg: '#FAEEDA', color: '#854F0B', count: 0, amount: 0, pct: 0 },
      ],
    };

    // Se tiver acesso às vendas do dia via API, recalcula:
    this.apiService.getSales().subscribe((sales: any[]) => {
      const todaySales = sales.filter(s => (s.created_at || '').startsWith(today));
      this.registerStats.count = todaySales.length;
      this.registerStats.total = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
      this.registerStats.avgTicket = this.registerStats.count > 0
        ? this.registerStats.total / this.registerStats.count : 0;

      this.registerStats.byPayment.forEach(p => {
        const filtered = todaySales.filter(s => s.payment_method === p.value);
        p.count  = filtered.length;
        p.amount = filtered.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
        p.pct    = this.registerStats.total > 0
          ? Math.round((p.amount / this.registerStats.total) * 100) : 0;
      });
    });

    this.registerForm = { opening_balance: null, closing_balance: null, notes: '' };
    this.showCloseRegisterModal = true;
  }

  closeCloseRegisterModal() { this.showCloseRegisterModal = false; }

  async confirmCloseRegister() {
    this.saving = true;
    const payload = {
      ...this.registerForm,
      total_sales:    this.registerStats.total,
      total_count:    this.registerStats.count,
      diff:           this.registerDiff,
      closed_at:      new Date().toISOString(),
    };
    // Chama endpoint de fechamento (ajuste a rota conforme seu backend)
    this.apiService.post('/register/close', payload).subscribe(
      () => {
        this.saving = false;
        this.closeCloseRegisterModal();
        this.showToast('Caixa fechado com sucesso!');
        this.router.navigate(['/dashboard']);
      },
      () => { this.saving = false; this.showToast('Erro ao fechar caixa'); }
    );
  }

  goToHistory() { this.router.navigate(['/sales/history']); }

  // ── Helpers ──────────────────────────────────
  paymentLabel(value: string): string {
    return this.paymentMethods.find(m => m.value === value)?.label || value;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  async showToast(message: string) {
    const t = await this.toastController.create({
      message, duration: 2500, position: 'bottom', color: 'success'
    });
    await t.present();
  }

  navigateTo(page: string) { this.router.navigate([`/${page}`]); }
  goBack()                  { this.router.navigate(['/dashboard']); }
}