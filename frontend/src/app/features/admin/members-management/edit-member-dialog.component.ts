import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-edit-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './edit-member-dialog.component.html',
  styleUrl: './edit-member-dialog.component.scss'
})
export class EditMemberDialogComponent implements OnInit {
  editForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: User },
    private http: HttpClient,
    private notification: NotificationService
  ) {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['', Validators.required],
      isActive: [true],
      addressStreet: [''],
      addressCity: [''],
      addressPostalCode: [''],
      password: [''], // Optionnel pour changer le mot de passe
      consentAnnuaire: [false],
      consentNewsletter: [false]
    });
  }

  ngOnInit(): void {
    if (this.data.member) {
      this.editForm.patchValue({
        firstName: this.data.member.firstName,
        lastName: this.data.member.lastName,
        email: this.data.member.email,
        phone: this.data.member.phone || '',
        role: this.data.member.role,
        isActive: this.data.member.isActive,
        addressStreet: this.data.member.addressStreet || '',
        addressCity: this.data.member.addressCity || '',
        addressPostalCode: this.data.member.addressPostalCode || '',
        consentAnnuaire: this.data.member.consentAnnuaire || false,
        consentNewsletter: this.data.member.consentNewsletter || false
      });
    }
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const formValue = { ...this.editForm.value };
      
      // Ne pas envoyer le mot de passe s'il est vide
      if (!formValue.password || formValue.password.trim() === '') {
        delete formValue.password;
      }

      this.http.patch<User>(`${environment.apiUrl}/users/admin/${this.data.member.id}`, formValue).subscribe({
        next: () => {
          this.notification.showSuccess('Membre modifié avec succès');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.notification.showError(error.error?.message || 'Erreur lors de la modification');
          console.error(error);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

