import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

interface deleteDTO {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: deleteDTO): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
