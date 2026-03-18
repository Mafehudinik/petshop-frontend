import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private navController: NavController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.showAlert('Erro', 'Preencha todos os campos');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Entrando...'
    });
    await loading.present();

    this.authService.login(this.email, this.password).subscribe(
      async (response) => {
        await loading.dismiss();
        await this.navController.navigateRoot('/dashboard');
      },
      async (error) => {
        await loading.dismiss();
        this.showAlert('Erro', 'Email ou senha inválidos');
      }
    );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
