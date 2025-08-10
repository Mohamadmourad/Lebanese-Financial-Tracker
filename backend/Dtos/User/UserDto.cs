using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.User
{
    public class UserDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string UserId { get; set; }
        public string Description { get; set; } = string.Empty;
        public double AmountInUsd { get; set; }
        public double AmountInLbn { get; set; }
    }
}