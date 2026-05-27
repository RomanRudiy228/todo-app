import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { z } from 'zod';
import { ButtonComponent } from '../../../components/button/button.component';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, LucideEye, LucideEyeOff],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  private loginSchema = z.object({
    email: z.string().email({ message: 'Enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  });

  error = '';
  loading = false;
  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    this.form.markAllAsTouched();
    this.error = '';

    const raw = this.form.getRawValue();
    const parsed = this.loginSchema.safeParse(raw);
    if (!parsed.success) {
      this.applyZodErrors(parsed.error);
      return;
    }

    this.loading = true;
    this.auth.login(parsed.data).subscribe({
      next: () => {
        this.auth.loadCurrentUser().subscribe({
          next: () => this.router.navigate(['/']),
          error: () => this.router.navigate(['/']),
        });
      },
      error: () => {
        this.error = 'Invalid email or password.';
        this.loading = false;
      },
    });
  }

  private applyZodErrors(error: z.ZodError) {
    for (const key of Object.keys(this.form.controls)) {
      const ctrl = this.form.get(key);
      const existing = ctrl?.errors ?? null;
      if (!existing?.['zod']) continue;
      const { zod: _zod, ...rest } = existing;
      ctrl?.setErrors(Object.keys(rest).length ? rest : null);
    }

    for (const issue of error.issues) {
      const key = issue.path[0];
      if (typeof key !== 'string') continue;
      const ctrl = this.form.get(key);
      if (!ctrl) continue;

      ctrl.setErrors({
        ...(ctrl.errors ?? {}),
        zod: issue.message,
      });
    }
  }
}
