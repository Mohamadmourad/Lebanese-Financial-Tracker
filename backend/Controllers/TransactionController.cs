using backend.Dtos.Transaction;
using backend.Dtos.User;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/transaction")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly TransactionService _transactionService;

        public TransactionController(UserService userService, TransactionService transactionService)
        {
            _userService = userService;
            _transactionService = transactionService;
        }

        [HttpGet("getTransactions")]
        public async Task<IActionResult> GetAllForUser()
        {
            try
            {
                var currentUser = HttpContext.Items["User"] as User;
                if (currentUser == null)
                {
                    return StatusCode(500, "Unauthaurized");
                }

                var transactions = await _transactionService.GetTransactionsByUserId(currentUser.Id);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAllForUser error: {ex}");
                return StatusCode(500, "An error occurred while fetching transactions.");
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] TransactionDto body)
        {
            try
            {
                var currentUser = HttpContext.Items["User"] as User;
                if (currentUser == null)
                {
                    return StatusCode(500, "Unauthaurized");
                }

                if (string.IsNullOrEmpty(body.Name) ||
                    string.IsNullOrEmpty(body.Type) ||
                    string.IsNullOrEmpty(body.Currency) ||
                    body.Amount <= 0)
                {
                    return BadRequest(new { message = "all fields are required" });
                }

                Console.WriteLine($"userId: {currentUser.Id}");
                var newTransaction = new Transaction
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = body.Name,
                    Type = body.Type,
                    Currency = body.Currency,
                    Amount = body.Amount,
                    UserId = currentUser.Id
                };

                var createdTransactionDto = await _transactionService.CreateTransaction(newTransaction);
                await _userService.RecalculateUserBalance(newTransaction, currentUser);

                return Ok(createdTransactionDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Transaction creation error: {ex}");
                return StatusCode(500, "An error occurred during creating transaction.");
            }
        }

        [HttpDelete("delete/{transactionId}")]
        public async Task<IActionResult> DeleteTransaction(string transactionId)
        {
            try
            {
                var currentUser = HttpContext.Items["User"] as User;
                if (currentUser == null)
                {
                    return StatusCode(500, "Unauthaurized");
                }

                await _transactionService.DeleteTransaction(transactionId, currentUser);
                return Ok("transaction deleted successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Delete transaction error: {ex}");
                return StatusCode(500, "An error occurred while deleting transaction.");
            }
        }
        

    }
}
