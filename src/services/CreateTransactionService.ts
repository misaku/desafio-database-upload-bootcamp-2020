import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionDTO {
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
  }: TransactionDTO): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total < value) {
      throw new AppError('insufficient Funds');
    }
    let categoryData = await categoriesRepository.findOne({ title: category });

    if (!categoryData) {
      categoryData = categoriesRepository.create({ title: category });
      await categoriesRepository.save(categoryData);
    }
    const category_id = categoryData.id;
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });
    await transactionsRepository.save(transaction);
    delete transaction.category_id;
    delete transaction.created_at;
    delete transaction.updated_at;
    delete categoryData.created_at;
    delete categoryData.updated_at;
    transaction.category = categoryData;
    return transaction;
  }
}

export default CreateTransactionService;
