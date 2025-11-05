import prisma from '../lib/prisma';

export class TokenService {
  /**
   * Award tokens to a user
   * Creates a transaction record and updates user balance atomically
   */
  static async awardTokens(
    userId: string,
    amount: number,
    reason: string
  ): Promise<{ newBalance: number }> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update user balance first
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            increment: amount,
          },
        },
        select: {
          tokenBalance: true,
        },
      });

      // Create transaction record with new balance
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount,
          balance: updatedUser.tokenBalance,
          reason,
        },
      });

      return { newBalance: updatedUser.tokenBalance };
    });

    return result;
  }

  /**
   * Deduct tokens from a user
   * Checks balance first, then creates transaction record and updates balance atomically
   */
  static async deductTokens(
    userId: string,
    amount: number,
    reason: string
  ): Promise<{ newBalance: number }> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get current balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.tokenBalance < amount) {
        throw new Error('Insufficient token balance');
      }

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            decrement: amount,
          },
        },
        select: {
          tokenBalance: true,
        },
      });

      // Create transaction record with new balance
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount: -amount,
          balance: updatedUser.tokenBalance,
          reason,
        },
      });

      return { newBalance: updatedUser.tokenBalance };
    });

    return result;
  }

  /**
   * Calculate composite task premium (15% bonus)
   */
  static calculateCompositePremium(subtaskCosts: number[]): number {
    const totalCost = subtaskCosts.reduce((sum, cost) => sum + cost, 0);
    const premium = Math.floor(totalCost * 1.15);
    return premium;
  }

  /**
   * Get user's transaction history
   */
  static async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    const transactions = await prisma.tokenTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions;
  }

  /**
   * Get user's current balance
   */
  static async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.tokenBalance;
  }
}
