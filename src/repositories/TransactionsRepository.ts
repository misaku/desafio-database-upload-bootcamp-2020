import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const data: Balance = { income: 0, outcome: 0, total: 0 };
    const transactions = await this.createQueryBuilder('tr')
      .select('tr.type', 'type')
      .addSelect('SUM(tr.value)', 'value')
      .groupBy('tr.type')
      .getRawMany();

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        data.income = Number(transaction.value);
      } else {
        data.outcome = Number(transaction.value);
      }
    });
    data.total = data.income - data.outcome;

    return data;
  }
}

export default TransactionsRepository;
