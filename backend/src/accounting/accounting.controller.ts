import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccountingService } from './accounting.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExpenseCategory } from './entities/expense.entity';
import { SupabaseService } from '../storage/supabase.service';

@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('expenses')
  @UseInterceptors(FileInterceptor('receipt'))
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Si un fichier est uploadé, l'envoyer à Supabase
    if (file) {
      const fileName = `expense-receipt-${Date.now()}-${file.originalname}`;
      const folder = 'expenses/receipts';

      try {
        const { url } = await this.supabaseService.uploadFile(
          file.buffer,
          fileName,
          folder,
        );

        createExpenseDto.receiptUrl = url;
      } catch (error: any) {
        throw new Error(`Erreur lors de l'upload du justificatif: ${error.message}`);
      }
    }

    return this.accountingService.create(createExpenseDto, req.user.id);
  }

  @Get('summary/:year')
  async getYearlySummary(@Param('year', ParseIntPipe) year: number) {
    return this.accountingService.getYearlySummary(year);
  }

  @Get('category-labels')
  async getCategoryLabels() {
    const categories = Object.values(ExpenseCategory);
    const labels: { [key: string]: string } = {};
    categories.forEach(category => {
      labels[category] = this.accountingService.getCategoryLabel(category);
    });
    return labels;
  }

  @Get('compare/:year1/:year2')
  async compareYears(
    @Param('year1', ParseIntPipe) year1: number,
    @Param('year2', ParseIntPipe) year2: number,
  ) {
    try {
      return await this.accountingService.getYearlyComparison(year1, year2);
    } catch (error) {
      console.error('Erreur dans compareYears:', error);
      throw error;
    }
  }

  @Get('export/excel')
  async exportExcel(
    @Res() res: Response,
    @Query('year') year?: number,
  ) {
    const expenses = year 
      ? await this.accountingService.findByYear(year)
      : await this.accountingService.findAll();

    // Générer CSV (compatible Excel)
    const headers = ['Date', 'Description', 'Catégorie', 'Montant', 'Année', 'Créé par'];
    const rows = expenses.map(e => [
      new Date(e.date).toLocaleDateString('fr-FR'),
      e.description,
      this.accountingService.getCategoryLabel(e.category),
      e.amount.toFixed(2),
      e.year.toString(),
      e.creator ? `${e.creator.firstName} ${e.creator.lastName}` : '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
    ].join('\n');

    const filename = `depenses_${year || 'toutes'}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\ufeff' + csvContent); // BOM UTF-8 pour Excel
  }

  @Get('export/pdf/:year')
  async exportPdf(
    @Param('year', ParseIntPipe) year: number,
    @Res() res: Response,
  ) {
    const PDFDocument = require('pdfkit');
    const summary = await this.accountingService.getYearlySummary(year);
    const expenses = await this.accountingService.findByYear(year);

    const doc = new PDFDocument({ margin: 50 });
    const filename = `rapport_comptable_${year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // En-tête
    doc.fontSize(20).text(`Rapport Comptable ${year}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Association 27 Degrés - Basse-Ville Génération`, { align: 'center' });
    doc.moveDown(2);

    // Résumé
    doc.fontSize(16).text('Résumé Financier', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Recettes: ${summary.totalRevenue.toFixed(2)} €`);
    doc.text(`Total Dépenses: ${summary.totalExpenses.toFixed(2)} €`);
    doc.text(`Solde: ${summary.balance.toFixed(2)} €`, { 
      color: summary.balance >= 0 ? '#00AA00' : '#AA0000' 
    });
    doc.moveDown(2);

    // Répartition par catégorie
    doc.fontSize(16).text('Répartition par Catégorie', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    Object.entries(summary.expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, amount]) => {
        const label = this.accountingService.getCategoryLabel(category as ExpenseCategory);
        const percentage = summary.totalExpenses > 0 
          ? ((amount / summary.totalExpenses) * 100).toFixed(1)
          : '0';
        doc.text(`${label}: ${amount.toFixed(2)} € (${percentage}%)`);
      });
    doc.moveDown(2);

    // Liste des dépenses
    doc.fontSize(16).text('Détail des Dépenses', { underline: true });
    doc.moveDown();
    doc.fontSize(10);
    
    expenses.forEach((expense, index) => {
      if (index > 0 && index % 20 === 0) {
        doc.addPage();
      }
      const date = new Date(expense.date).toLocaleDateString('fr-FR');
      const category = this.accountingService.getCategoryLabel(expense.category);
      doc.text(`${date} - ${expense.description}`, { continued: false });
      doc.text(`  ${category} - ${expense.amount.toFixed(2)} €`, { indent: 20 });
      doc.moveDown(0.5);
    });

    doc.end();
  }

  @Get('expenses')
  async findAll(@Query('year') year?: number, @Query('category') category?: string) {
    if (year) {
      return this.accountingService.findByYear(year);
    }
    if (category) {
      return this.accountingService.findByCategory(category as any);
    }
    return this.accountingService.findAll();
  }

  @Get('expenses/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountingService.findOne(id);
  }

  @Patch('expenses/:id')
  @UseInterceptors(FileInterceptor('receipt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Si un nouveau fichier est uploadé, l'envoyer à Supabase
    if (file) {
      const fileName = `expense-receipt-${Date.now()}-${file.originalname}`;
      const folder = 'expenses/receipts';

      try {
        const { url } = await this.supabaseService.uploadFile(
          file.buffer,
          fileName,
          folder,
        );

        updateExpenseDto.receiptUrl = url;
      } catch (error: any) {
        throw new Error(`Erreur lors de l'upload du justificatif: ${error.message}`);
      }
    }

    return this.accountingService.update(id, updateExpenseDto);
  }

  @Delete('expenses/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.accountingService.remove(id);
    return { message: 'Expense deleted successfully' };
  }
}
