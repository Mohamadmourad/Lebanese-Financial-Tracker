using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Services
{
    public class JwtService
    {
        private readonly string _secretKey;
        private readonly UserService _userService;

        public JwtService(IConfiguration config, UserService userService)
        {
            _secretKey = config["Jwt:Key"];
            _userService = userService;
        }

        public string GenerateToken(string userId)
        {
            var key = Encoding.UTF8.GetBytes(_secretKey);
            var securityKey = new SymmetricSecurityKey(key);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] { new Claim("userId", userId) };

            var token = new JwtSecurityToken(
                claims: claims,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string? VerifyToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secretKey);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false, 
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                return jwtToken.Claims.First(x => x.Type == "userId").Value;
            }
            catch
            {
                return null;
            }
        }
        public async Task<User?> GetUserFromContext(HttpContext context)
        {
            var token = context.Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(token))
                return null;

            var userId = VerifyToken(token);
            if (string.IsNullOrEmpty(userId))
                return null;

            var user = await _userService.GetUserByIdAsync(userId);
            return user;
        }
    }
}
