import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DataService } from '../../../services/data.service';

import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, HttpClientModule], // Use HttpClientModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  loginForm: FormGroup;
  captchaText: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private fb: FormBuilder, private ds: DataService) {
    this.loginForm = this.fb.group({
      user_id: ['', Validators.required],
      password: ['', Validators.required],
      userCaptchaInput: ['', Validators.required]
    });
    this.generateCaptcha();
  }

  generateCaptcha() {
    this.captchaText = Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  ngOnInit(): void {
    if (!localStorage.getItem('sessionID')) {
      history.pushState(null, '', location.href);
      window.onpopstate = () => {
        history.pushState(null, '', location.href);
      };
    }
  }

  validateCaptcha() {
    if (this.loginForm.value.userCaptchaInput.toUpperCase() !== this.captchaText) {
      this.errorMessage = 'Captcha does not match. Try again!';
      this.generateCaptcha();
      this.loginForm.patchValue({ userCaptchaInput: '' });
      return false;
    }
    this.errorMessage = '';
    return true;
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (!this.validateCaptcha()) return;

    this.ds.postData('login', {
      user_id: this.loginForm.value.user_id,
      password: this.loginForm.value.password
    }, { withCredentials: true }).subscribe({
      next: (res: any) => {
        console.log(res);
        localStorage.setItem('sessionID', res.sessionID);
        localStorage.setItem('role_id', res.role_id); 
        const expiresAt = res.expiresAt;
        const userId = this.loginForm.value.user_id;

        const defaultRoute = res.defaultRoute || 'dashboard'; // fallback

        this.router.navigate(['header']);
      },
      error: () => {
        alert('Invalid Username or Password');
      }
    });
  }

  goToHome() {
    this.router.navigate(['']);
  }
}
