import { Router } from 'express';
import { createRecord, getRecords, getRecordById, updateRecord, deleteRecord } from '../controllers/record.controller';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { createRecordSchema, updateRecordSchema, getRecordsQuerySchema } from '../schemas/record.schema';

const router = Router();

router.use(authenticate);

// List and create records
router.get('/', requireRole(['ANALYST', 'ADMIN']), validate(getRecordsQuerySchema), getRecords);
router.post('/', requireRole(['ADMIN']), validate(createRecordSchema), createRecord);

// Get, update, delete specific record
router.get('/:id', requireRole(['ANALYST', 'ADMIN']), getRecordById);
router.put('/:id', requireRole(['ADMIN']), validate(updateRecordSchema), updateRecord);
router.delete('/:id', requireRole(['ADMIN']), deleteRecord);

export default router;
