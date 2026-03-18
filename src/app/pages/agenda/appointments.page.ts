import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';

export interface WeekDay {
  name: string;
  number: number;
  date: string;
  isToday: boolean;
  isWeekend: boolean;
}

export interface TimeSlot {
  label: string;
  hour: number;
}

interface AppointmentForm {
  pet_id:           number | null;
  service_id:       number | null;
  employee_id:      number | null;
  appointment_date: string;
  appointment_time: string;
  notes:            string;
}

// Paleta de avatares para funcionários
const EMP_COLORS = ['#1b5e35', '#185FA5', '#854F0B', '#993556', '#534AB7'];

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss']
})
export class AppointmentsPage implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  employees: any[] = [];
  services: any[] = [];
  selectedEmployee: string = '';
  viewMode: 'day' | 'week' = 'week';
  loading: boolean = false;
  currentUser: any;
  userInitials: string = 'AD';

  private pivotDate: Date = new Date();

  statusLegend = [
    { label: 'Concluído',    bg: '#EAF3DE', border: '#1b5e35' },
    { label: 'Confirmado',   bg: '#E6F1FB', border: '#185FA5' },
    { label: 'Em andamento', bg: '#FAEEDA', border: '#854F0B' },
    { label: 'Agendado',     bg: '#FBEAF0', border: '#993556' },
  ];

  timeSlots: TimeSlot[] = Array.from({ length: 13 }, (_, i) => ({
    hour: i + 7,
    label: `${String(i + 7).padStart(2, '0')}:00`,
  }));

  // ── Modal ──────────────────────────────────
  showModal:  boolean = false;
  isEditing:  boolean = false;
  saving:     boolean = false;
  editingId:  number | null = null;
  form:       AppointmentForm = this.emptyForm();
  formErrors: any = {};

  // Busca de pet
  petSearch:   string = '';
  petResults:  any[] = [];
  selectedPet: any = null;
  private petSearchTimeout: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadData();
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
      if (user?.name) {
        this.userInitials = user.name
          .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
      }
    });
  }

  // ── Carregar dados ──────────────────────────
  loadData() {
    this.loading = true;
    this.apiService.getAppointments().subscribe(
      (data: any[]) => { this.appointments = data; this.applyFilter(); this.loading = false; },
      () => { this.loading = false; }
    );
    this.apiService.getEmployees().subscribe(
      (data: any[]) => { this.employees = data; }
    );
    this.apiService.getServices().subscribe(
      (data: any[]) => { this.services = data; }
    );
  }

  // ── Navegação de período ────────────────────
  get weekDays(): WeekDay[] {
    const monday = this.getMondayOf(this.pivotDate);
    const today  = this.toISO(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        name: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i],
        number: d.getDate(),
        date: this.toISO(d),
        isToday: this.toISO(d) === today,
        isWeekend: i >= 5,
      };
    });
  }

  get periodLabel(): string {
    if (this.viewMode === 'day') {
      return this.pivotDate.toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long'
      });
    }
    const days  = this.weekDays;
    const first = new Date(days[0].date);
    const last  = new Date(days[6].date);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${first.toLocaleDateString('pt-BR', opts)} – ${last.toLocaleDateString('pt-BR', opts)} ${last.getFullYear()}`;
  }

  prevPeriod() {
    const d = new Date(this.pivotDate);
    this.viewMode === 'week' ? d.setDate(d.getDate() - 7) : d.setDate(d.getDate() - 1);
    this.pivotDate = d;
  }
  nextPeriod() {
    const d = new Date(this.pivotDate);
    this.viewMode === 'week' ? d.setDate(d.getDate() + 7) : d.setDate(d.getDate() + 1);
    this.pivotDate = d;
  }
  goToToday() { this.pivotDate = new Date(); }
  setView(mode: 'day' | 'week') { this.viewMode = mode; }

  // ── Filtro funcionário ──────────────────────
  filterByEmployee() { this.applyFilter(); }
  private applyFilter() {
    this.filteredAppointments = this.selectedEmployee
      ? this.appointments.filter(a => String(a.employee_id) === String(this.selectedEmployee))
      : [...this.appointments];
  }

  // ── Helpers de calendário ───────────────────
  getAppointments(date: string, hour: number): any[] {
    return this.filteredAppointments.filter(a => {
      const apptDate = (a.appointment_date || '').split('T')[0];
      const apptHour = parseInt((a.appointment_time || '00:00').split(':')[0], 10);
      return apptDate === date && apptHour === hour;
    });
  }

  getDayAppointments(hour: number): any[] {
    return this.getAppointments(this.toISO(this.pivotDate), hour);
  }

  // ── Cliques no calendário ───────────────────
  onCellClick(day: WeekDay, slot: TimeSlot) {
    this.openModal(undefined, day.date, slot.label);
  }
  onTimeSlotClick(hour: number) {
    const label = `${String(hour).padStart(2, '0')}:00`;
    this.openModal(undefined, this.toISO(this.pivotDate), label);
  }
  onApptClick(event: Event, appt: any) {
    event.stopPropagation();
    this.router.navigate(['/appointments', appt.id]);
  }

  // ── Abrir / fechar modal ────────────────────
  openModal(appt?: any, date?: string, time?: string) {
    this.formErrors  = {};
    this.petSearch   = '';
    this.petResults  = [];

    if (appt) {
      this.isEditing  = true;
      this.editingId  = appt.id;
      this.form = {
        pet_id:           appt.pet_id           || null,
        service_id:       appt.service_id       || null,
        employee_id:      appt.employee_id      || null,
        appointment_date: (appt.appointment_date || '').split('T')[0],
        appointment_time: appt.appointment_time  || '',
        notes:            appt.notes            || '',
      };
      this.selectedPet = appt.pet_id
        ? { id: appt.pet_id, name: appt.pet_name, breed: appt.pet_breed, client_name: appt.client_name }
        : null;
    } else {
      this.isEditing   = false;
      this.editingId   = null;
      this.selectedPet = null;
      this.form        = this.emptyForm();
      if (date) this.form.appointment_date = date;
      if (time) this.form.appointment_time = time;
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal   = false;
    this.formErrors  = {};
    this.petSearch   = '';
    this.petResults  = [];
    this.selectedPet = null;
  }

  addAppointment() { this.openModal(); }

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
    this.selectedPet      = pet;
    this.form.pet_id      = pet.id;
    this.petResults       = [];
    this.petSearch        = '';
    this.formErrors.pet_id = '';
  }

  clearPet() {
    this.selectedPet  = null;
    this.form.pet_id  = null;
    this.petSearch    = '';
  }

  // ── Seleção de serviço e funcionário ─────────
  selectService(service: any) {
    this.form.service_id = service.id;
    this.formErrors.service_id = '';
  }

  selectEmployee(emp: any) {
    this.form.employee_id = emp.id;
    this.formErrors.employee_id = '';
  }

  // ── Validação ───────────────────────────────
  validateField(field: string) {
    this.formErrors[field] = '';
    if (field === 'pet_id'           && !this.form.pet_id)           this.formErrors.pet_id           = 'Selecione o pet';
    if (field === 'service_id'       && !this.form.service_id)       this.formErrors.service_id       = 'Selecione o serviço';
    if (field === 'employee_id'      && !this.form.employee_id)      this.formErrors.employee_id      = 'Selecione o funcionário';
    if (field === 'appointment_date' && !this.form.appointment_date) this.formErrors.appointment_date = 'Data é obrigatória';
    if (field === 'appointment_time' && !this.form.appointment_time) this.formErrors.appointment_time = 'Horário é obrigatório';
  }

  private validateAll(): boolean {
    ['pet_id','service_id','employee_id','appointment_date','appointment_time'].forEach(f => this.validateField(f));
    return !Object.values(this.formErrors).some(e => !!e);
  }

  // ── Salvar agendamento ──────────────────────
  async saveAppointment() {
    if (!this.validateAll()) return;
    this.saving = true;

    const request$ = this.isEditing
      ? this.apiService.updateAppointment(this.editingId!, { ...this.form })
      : this.apiService.createAppointment({ ...this.form });

    request$.subscribe(
      () => {
        this.saving = false;
        this.closeModal();
        this.loadData();
        this.showToast(this.isEditing ? 'Agendamento atualizado!' : 'Agendamento criado!');
      },
      () => { this.saving = false; this.showToast('Erro ao salvar agendamento'); }
    );
  }

  // ── Avatar helpers ──────────────────────────
  getInitials(name: string): string {
    if (!name) return '?';
    return name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getEmpAvatarBg(empId: number): string {
    const idx = this.employees.findIndex(e => e.id === empId) % EMP_COLORS.length;
    return EMP_COLORS[idx >= 0 ? idx : 0];
  }

  // ── Utils ────────────────────────────────────
  private emptyForm(): AppointmentForm {
    return {
      pet_id: null, service_id: null, employee_id: null,
      appointment_date: this.toISO(new Date()),
      appointment_time: '08:00',
      notes: '',
    };
  }

  private getMondayOf(date: Date): Date {
    const d   = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private toISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async showToast(message: string) {
    const t = await this.toastController.create({
      message, duration: 2000, position: 'bottom', color: 'success'
    });
    await t.present();
  }

  goBack() { this.router.navigate(['/dashboard']); }
}