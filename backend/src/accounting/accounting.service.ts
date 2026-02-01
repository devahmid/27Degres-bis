import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseCategory } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CotisationsService } from '../cotisations/cotisations.service';
import { SupabaseService } from '../storage/supabase.service';

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    private cotisationsService: CotisationsService,
    private supabaseService: SupabaseService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, createdBy: number): Promise<Expense> {
    const expense = this.expensesRepository.create({
      ...createExpenseDto,
      createdBy,
      date: new Date(createExpenseDto.date),
    });
    return this.expensesRepository.save(expense);
  }

  async findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({
      relations: ['creator', 'validator'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByYear(year: number): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { year },
      relations: ['creator', 'validator'],
      order: { date: 'DESC' },
    });
  }

  async findByCategory(category: ExpenseCategory): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { category },
      relations: ['creator', 'validator'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ['creator', 'validator'],
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    
    // Si un nouveau justificatif est fourni, supprimer l'ancien
    if (updateExpenseDto.receiptUrl && expense.receiptUrl && updateExpenseDto.receiptUrl !== expense.receiptUrl) {
      try {
        const oldFilePath = this.supabaseService.extractFilePathFromPublicUrl(expense.receiptUrl);
        if (oldFilePath) {
          await this.supabaseService.deleteFile(oldFilePath);
        }
      } catch (error) {
        console.error(`Erreur lors de la suppression de l'ancien justificatif pour la dépense ${id}:`, error);
        // Continuer la mise à jour même si l'ancien fichier ne peut pas être supprimé
      }
    }
    
    if (updateExpenseDto.date) {
      updateExpenseDto.date = new Date(updateExpenseDto.date) as any;
    }
    Object.assign(expense, updateExpenseDto);
    return this.expensesRepository.save(expense);
  }

  async remove(id: number): Promise<void> {
    const expense = await this.findOne(id);
    
    // Supprimer le justificatif de Supabase Storage si présent
    if (expense.receiptUrl) {
      try {
        const filePath = this.supabaseService.extractFilePathFromPublicUrl(expense.receiptUrl);
        if (filePath) {
          await this.supabaseService.deleteFile(filePath);
        }
      } catch (error) {
        console.error(`Erreur lors de la suppression du justificatif pour la dépense ${id}:`, error);
        // Continuer la suppression même si le fichier ne peut pas être supprimé
      }
    }
    
    await this.expensesRepository.remove(expense);
  }

  async getYearlyComparison(year1: number, year2: number): Promise<{
    year1: { year: number; totalRevenue: number; totalExpenses: number; balance: number };
    year2: { year: number; totalRevenue: number; totalExpenses: number; balance: number };
    revenueChange: number;
    revenueChangePercent: number;
    expensesChange: number;
    expensesChangePercent: number;
    balanceChange: number;
  }> {
    const summary1 = await this.getYearlySummary(year1);
    const summary2 = await this.getYearlySummary(year2);

    const revenueChange = summary2.totalRevenue - summary1.totalRevenue;
    const revenueChangePercent = summary1.totalRevenue > 0 
      ? (revenueChange / summary1.totalRevenue) * 100 
      : 0;

    const expensesChange = summary2.totalExpenses - summary1.totalExpenses;
    const expensesChangePercent = summary1.totalExpenses > 0 
      ? (expensesChange / summary1.totalExpenses) * 100 
      : 0;

    const balanceChange = summary2.balance - summary1.balance;

    return {
      year1: {
        year: year1,
        totalRevenue: summary1.totalRevenue,
        totalExpenses: summary1.totalExpenses,
        balance: summary1.balance,
      },
      year2: {
        year: year2,
        totalRevenue: summary2.totalRevenue,
        totalExpenses: summary2.totalExpenses,
        balance: summary2.balance,
      },
      revenueChange,
      revenueChangePercent,
      expensesChange,
      expensesChangePercent,
      balanceChange,
    };
  }

  async getYearlySummary(year: number): Promise<{
    year: number;
    totalRevenue: number;
    totalExpenses: number;
    balance: number;
    expensesByCategory: { [key: string]: number };
    cotisationsCount: number;
    expensesCount: number;
  }> {
    // Calculer les recettes (cotisations payées de l'année)
    const cotisations = await this.cotisationsService.findByYear(year);
    const paidCotisations = cotisations.filter(c => c.status === 'paid');
    const totalRevenue = paidCotisations.reduce((sum, c) => sum + Number(c.amount), 0);

    // Calculer les dépenses de l'année
    const expenses = await this.findByYear(year);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Répartition par catégorie
    const expensesByCategory: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const category = expense.category;
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += Number(expense.amount);
    });

    return {
      year,
      totalRevenue,
      totalExpenses,
      balance: totalRevenue - totalExpenses,
      expensesByCategory,
      cotisationsCount: paidCotisations.length,
      expensesCount: expenses.length,
    };
  }

  getCategoryLabel(category: ExpenseCategory): string {
    const labels: { [key in ExpenseCategory]: string } = {
      [ExpenseCategory.LOCATION_SALLE]: 'Location de salle',
      [ExpenseCategory.MATERIEL]: 'Matériel / Fournitures',
      [ExpenseCategory.TRANSPORT]: 'Transport / Déplacement',
      [ExpenseCategory.COMMUNICATION]: 'Communication / Marketing',
      [ExpenseCategory.ASSURANCE]: 'Assurance',
      [ExpenseCategory.FRAIS_BANCAIRES]: 'Frais bancaires',
      [ExpenseCategory.EVENEMENTS]: 'Événements / Organisation',
      [ExpenseCategory.ADMINISTRATIF]: 'Administratif',
      [ExpenseCategory.AUTRE]: 'Autre',
    };
    return labels[category] || category;
  }
}
