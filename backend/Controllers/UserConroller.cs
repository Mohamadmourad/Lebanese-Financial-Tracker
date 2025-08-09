using backend.Dtos.User;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly JwtService _jwtService;

        public UserController(UserService userService, JwtService jwtService)
        {
            _userService = userService;
            _jwtService = jwtService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupDto body)
        {
            try
            {
                if (string.IsNullOrEmpty(body.Username) ||
                    string.IsNullOrEmpty(body.Email) ||
                    string.IsNullOrEmpty(body.Password))
                {
                    return BadRequest(new { message = "all fields are required" });
                }

                var (isAvailable, reason) = await _userService.IsUserAvailable(body.Email, body.Username);
                if (!isAvailable)
                    return BadRequest(new { message = reason });

                var newUser = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = body.Username,
                    Email = body.Email,
                    Password = body.Password,
                    Description = body.Description,
                    AmountInUsd = 0,
                    AmountInLbn = 0
                };

                newUser = await _userService.CreateUser(newUser);
                string jwtToken = _jwtService.GenerateToken(newUser.Id);
                Console.WriteLine(jwtToken);

                return Ok(new { jwtToken });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Signup error: {ex}");
                return StatusCode(500, "An error occurred during signup.");
            }
        }
        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto body)
        {
            try
            {
                if (string.IsNullOrEmpty(body.Email) ||
                    string.IsNullOrEmpty(body.Password))
                {
                    return BadRequest(new {message = "all fields are required"});
                }

                var (isAvailable, reason) = await _userService.LoginUser(body.Email, body.Password);
                if (!isAvailable)
                    return BadRequest(new {message = reason});

                string jwtToken = _jwtService.GenerateToken(reason);
                Console.WriteLine(jwtToken);

                return Ok(new { jwtToken });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex}");
                return StatusCode(500, "An error occurred during login.");
            }
        }


    }
}
