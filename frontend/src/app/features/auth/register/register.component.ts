import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { z } from 'zod';
import { ButtonComponent } from '../../../components/button/button.component';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, LucideEye, LucideEyeOff],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  private registerSchema = z
    .object({
      email: z.string().email({ message: 'Enter a valid email.' }),
      userName: z.string().optional(),
      password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
      confirmPassword: z.string().min(1, { message: 'Confirm password is required.' }),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Passwords do not match.',
        });
      }
    });

  error = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    userName: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  submit() {
    this.form.markAllAsTouched();
    this.loading = true;
    this.error = '';

    const raw = this.form.getRawValue();
    const parsed = this.registerSchema.safeParse(raw);
    if (!parsed.success) {
      this.loading = false;
      this.applyZodErrors(parsed.error);
      return;
    }

    const { email, password, userName } = parsed.data;
    this.auth.register({ email, password, userName: userName || undefined }).subscribe({
      next: () => {
        this.auth.loadCurrentUser().subscribe({
          next: () => this.router.navigate(['/']),
          error: () => this.router.navigate(['/']),
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed.';
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
