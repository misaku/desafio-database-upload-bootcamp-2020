import fs from 'fs';
import parse from 'csv-parse';
import util from 'util';
import path from 'path';
import { uploadDirectory } from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import AppError from '../errors/AppError';

interface CsvDTO {
  fileName: string;
}

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  private createTransactionService: CreateTransactionService = new CreateTransactionService();

  private async doCreateTransaction(
    transactions: TransactionDTO[],
  ): Promise<Transaction[]> {
    const [transaction, ...newTransactions] = transactions;
    const newTransaction = await this.createTransactionService.execute(
      transaction,
    );
    if (newTransactions.length > 0) {
      const TrancationsCreated = await this.doCreateTransaction(
        newTransactions,
      );
      return [newTransaction, ...TrancationsCreated];
    }
    return [newTransaction];
  }

  async execute({ fileName }: CsvDTO): Promise<Transaction[]> {
    const userAvatarFilePath = path.join(uploadDirectory, fileName);
    const csvParse: any = util.promisify(parse);
    const userAvatarFileExist = await fs.promises.stat(userAvatarFilePath);
    if (!userAvatarFileExist) {
      throw new AppError('cant find file to imported');
    }
    const csvFile = await fs.promises.readFile(userAvatarFilePath);
    const csvData: TransactionDTO[] = await csvParse(csvFile, {
      columns: true,
      trim: true,
    });

    csvData.forEach((transaction, index) => {
      csvData[index].value = Number(transaction.value);
    });

    const results: Transaction[] = await this.doCreateTransaction(csvData);

    return results;
  }
}

export default ImportTransactionsService;
