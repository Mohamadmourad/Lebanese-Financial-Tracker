using backend.Models;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity; // For PasswordHasher

namespace backend.Services
{
    public class UserService
    {
        private readonly ApplicationDBContext _context;
        private readonly PasswordHasher<User> _passwordHasher;

        public UserService(ApplicationDBContext context)
        {
            _context = context;
            _passwordHasher = new PasswordHasher<User>();
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<(bool IsAvailable, string Reason)> IsUserAvailable(string email, string username)
        {
            User? user = await _context.User
                .FirstOrDefaultAsync(u => u.Email == email || u.Username == username);

            if (user == null)
                return (true, "Email and username are available.");

            return user.Username == username
                ? (false, "Username already exists.")
                : (false, "Email already exists.");
        }

        public async Task<UserAvailability> IsUserAvailableRecord(string email, string username)
        {
            User? user = await _context.User
                .FirstOrDefaultAsync(u => u.Email == email || u.Username == username);

            if (user == null)
                return new UserAvailability(true, "Email and username are available.");

            return user.Username == username
                ? new UserAvailability(false, "Username already exists.")
                : new UserAvailability(false, "Email already exists.");
        }

        public async Task<UserAvailability> LoginUser(string email, string password)
        {
            User? user = await _context.User
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user != null)
            {
                var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.Password, password);

                if (verificationResult == PasswordVerificationResult.Success)
                {
                    return new UserAvailability(true, user.Id);
                }
                else
                {
                    return new UserAvailability(false, "Invalid email or password");
                }
            }

            return new UserAvailability(false, "Invalid email or password");
        }

        public async Task<User> CreateUser(User user)
        {
            string hashedPassword = _passwordHasher.HashPassword(user, user.Password);
            user.Password = hashedPassword;

            if (string.IsNullOrWhiteSpace(user.Id))
                user.Id = Guid.NewGuid().ToString();

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User> RecalculateUserBalance(Transaction transaction, User user)
        {
            if (transaction.Type == "Expenses")
            {
                if (transaction.Currency.ToLower() == "usd")
                    user.AmountInUsd -= transaction.Amount;
                else
                    user.AmountInLbn -= transaction.Amount;
            }
            else
            {
                if (transaction.Currency.ToLower() == "usd")
                    user.AmountInUsd += transaction.Amount;
                else
                    user.AmountInLbn += transaction.Amount;
            }

            _context.User.Update(user);

            await _context.SaveChangesAsync();

            return user;
        }

    }

    public record UserAvailability(bool IsAvailable, string Reason);
}
