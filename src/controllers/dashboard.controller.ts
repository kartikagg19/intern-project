import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const aggregations = await prisma.record.groupBy({
      by: ['type'],
      _sum: {
        amount: true,
      },
    });

    const income = aggregations.find(a => a.type === 'INCOME')?._sum.amount || 0;
    const expense = aggregations.find(a => a.type === 'EXPENSE')?._sum.amount || 0;
    const balance = income - expense;

    res.json({ income, expense, balance });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategoryTotals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query; // optional filter by INCOME or EXPENSE
    const whereClause = type ? { type: String(type) } : {};

    const categoryTotals = await prisma.record.groupBy({
      by: ['category', 'type'],
      where: whereClause,
      _sum: {
        amount: true,
      },
    });

    const formattedTotals = categoryTotals.map(c => ({
      category: c.category,
      type: c.type,
      total: c._sum.amount || 0,
    }));

    res.json(formattedTotals);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const recentRecords = await prisma.record.findMany({
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    });

    res.json(recentRecords);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
