import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ── Métodos genéricos ─────────────────────────
  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() });
  }

  post(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${endpoint}`, data, { headers: this.getHeaders() });
  }

  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${endpoint}`, data, { headers: this.getHeaders() });
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() });
  }

  // ── Dashboard ─────────────────────────────────
  getDashboardStats(): Observable<any>    { return this.get('/dashboard/stats'); }
  getTodayAppointments(): Observable<any> { return this.get('/dashboard/appointments'); }
  getActiveHotel(): Observable<any>       { return this.get('/hotel/active'); }

  // ── Clientes ──────────────────────────────────
  getClients(): Observable<any>                          { return this.get('/clients'); }
  createClient(data: any): Observable<any>               { return this.post('/clients', data); }
  updateClient(id: number, data: any): Observable<any>   { return this.put(`/clients/${id}`, data); }
  deleteClient(id: number): Observable<any>              { return this.delete(`/clients/${id}`); }
  searchClients(name: string): Observable<any>           { return this.get(`/clients/search?name=${encodeURIComponent(name)}`); }

  // ── Pets ──────────────────────────────────────
  getPets(): Observable<any>                             { return this.get('/pets'); }
  createPet(data: any): Observable<any>                  { return this.post('/pets', data); }
  updatePet(id: number, data: any): Observable<any>      { return this.put(`/pets/${id}`, data); }
  deletePet(id: number): Observable<any>                 { return this.delete(`/pets/${id}`); }
  searchPets(name: string): Observable<any>              { return this.get(`/pets/search?name=${encodeURIComponent(name)}`); }

  // ── Agendamentos ──────────────────────────────
  getAppointments(): Observable<any>                          { return this.get('/appointments'); }
  createAppointment(data: any): Observable<any>               { return this.post('/appointments', data); }
  updateAppointment(id: number, data: any): Observable<any>   { return this.put(`/appointments/${id}`, data); }
  deleteAppointment(id: number): Observable<any>              { return this.delete(`/appointments/${id}`); }

  // ── Serviços ──────────────────────────────────
  getServices(): Observable<any>                         { return this.get('/services'); }
  createService(data: any): Observable<any>              { return this.post('/services', data); }
  updateService(id: number, data: any): Observable<any>  { return this.put(`/services/${id}`, data); }
  deleteService(id: number): Observable<any>             { return this.delete(`/services/${id}`); }

  // ── Funcionários ──────────────────────────────
  getEmployees(): Observable<any>                        { return this.get('/employees'); }
  createEmployee(data: any): Observable<any>             { return this.post('/employees', data); }
  updateEmployee(id: number, data: any): Observable<any> { return this.put(`/employees/${id}`, data); }
  deleteEmployee(id: number): Observable<any>            { return this.delete(`/employees/${id}`); }

  // ── Hotel ─────────────────────────────────────
  getHotelStays(): Observable<any>                       { return this.get('/hotel'); }
  createHotelStay(data: any): Observable<any>            { return this.post('/hotel', data); }
  updateHotelStay(id: number, data: any): Observable<any>{ return this.put(`/hotel/${id}`, data); }
  checkoutHotelStay(id: number): Observable<any>         { return this.post(`/hotel/${id}/checkout`, {}); }

  // ── Estoque / Produtos ────────────────────────
  getProducts(): Observable<any>                         { return this.get('/products'); }
  createProduct(data: any): Observable<any>              { return this.post('/products', data); }
  updateProduct(id: number, data: any): Observable<any>  { return this.put(`/products/${id}`, data); }
  deleteProduct(id: number): Observable<any>             { return this.delete(`/products/${id}`); }
  restockProduct(id: number, qty: number): Observable<any> {
    return this.post(`/products/${id}/restock`, { qty });
  }

  // ── Vendas ────────────────────────────────────
  getCatalog(): Observable<any>                          { return this.get('/catalog'); }
  createSale(data: any): Observable<any>                 { return this.post('/sales', data); }
  getSales(): Observable<any>                            { return this.get('/sales'); }

  // ── Relatórios ────────────────────────────────
  getReports(params?: any): Observable<any> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.get(`/reports${query}`);
  }
}