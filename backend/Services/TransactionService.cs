using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos.Transaction;
using backend.Models;

namespace backend.Services
{
    public class TransactionService
    {

        private readonly ApplicationDBContext _context;
        private readonly UserService _userService;

        public TransactionService(ApplicationDBContext context, UserService userService)
        {
            _context = context;
            _userService = userService;
        }

        public async Task<TransactionDto> CreateTransaction(Transaction transaction)
        {
            _context.Transaction.Add(transaction);
            await _context.SaveChangesAsync();

            return new TransactionDto
            {
                Name = transaction.Name,
                Type = transaction.Type,
                Currency = transaction.Currency,
                Amount = transaction.Amount
            };
        }

        public async Task<List<TransactionDto>> GetTransactionsByUserId(string userId)
        {
            return await _context.Transaction
                .Where(t => t.UserId == userId)
                .Select(t => new TransactionDto
                {
                    Name = t.Name,
                    Type = t.Type,
                    Currency = t.Currency,
                    Amount = t.Amount
                })
                .ToListAsync();
        }

       public async Task<bool> DeleteTransaction(string transactionId, User user)
        {
            var transaction = await _context.Transaction.FindAsync(transactionId);
            if (transaction == null)
            {
                return false; 
            }

            _context.Transaction.Remove(transaction);
            if (transaction.Type == "Expenses")
            {
                transaction.Type = "Income";
            }
            else
            {
                transaction.Type = "Expenses";
            }
            await _userService.RecalculateUserBalance(transaction, user);
            
            await _context.SaveChangesAsync();

            return true;
        }

    }
}