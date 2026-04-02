import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const createRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, type, category, date, notes } = req.body;
    const userId = req.user!.id;

    const record = await prisma.record.create({
      data: {
        amount,
        type,
        category,
        date: new Date(date),
        notes,
        userId,
      },
    });

    res.status(201).json({ message: 'Record created successfully', record });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, category, startDate, endDate, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.RecordWhereInput = {};

    if (type) where.type = type as string;
    if (category) where.category = category as string;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { date: 'desc' },
      }),
      prisma.record.count({ where }),
    ]);

    res.json({
      data: records,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecordById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const record = await prisma.record.findUnique({ where: { id } });

    if (!record) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const record = await prisma.record.update({
      where: { id },
      data: updates,
    });

    res.json({ message: 'Record updated successfully', record });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.record.delete({ where: { id } });
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
