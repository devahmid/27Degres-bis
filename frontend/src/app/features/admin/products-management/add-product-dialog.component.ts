import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProductsService, Product } from '../../../core/services/products.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './add-product-dialog.component.html',
  styleUrl: './add-product-dialog.component.scss'
})
export class AddProductDialogComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product } | null | undefined,
    private productsService: ProductsService,
    private notification: NotificationService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: [''],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required],
      isFeatured: [false]
    });
  }

  ngOnInit(): void {
    if (this.data?.product) {
      this.isEditMode = true;
      const product = this.data.product;
      this.productForm.patchValue({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category || '',
        stockQuantity: product.stockQuantity,
        status: product.status,
        isFeatured: product.isFeatured
      });
      if (product.imageUrl) {
        this.imagePreview = product.imageUrl;
      }
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      
      if (this.isEditMode && this.data?.product) {
        this.productsService.update(this.data.product.id, formValue, this.selectedImage || undefined).subscribe({
          next: () => {
            this.notification.showSuccess('Produit modifié avec succès');
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.notification.showError('Erreur lors de la modification du produit');
            console.error(error);
          }
        });
      } else {
        this.productsService.create(formValue, this.selectedImage || undefined).subscribe({
          next: () => {
            this.notification.showSuccess('Produit créé avec succès');
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.notification.showError('Erreur lors de la création du produit');
            console.error(error);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

