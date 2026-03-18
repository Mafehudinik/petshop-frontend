import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response: any) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  private loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get(`${this.apiUrl}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe(
        (user: any) => this.currentUserSubject.next(user),
        () => this.logout()
      );
    }
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }
}
