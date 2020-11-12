import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid type.');
    }

    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError('outcome greater than total');
    }

    const categoryExist = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExist) {
      const createCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(createCategory);

      const transaction = transactionRepository.create({
        title,
        type,
        value,
        category_id: createCategory.id,
        category: createCategory,
      });

      await transactionRepository.save(transaction);
      return transaction;
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categoryExist.id,
      category: categoryExist,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
