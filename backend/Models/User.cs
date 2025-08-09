using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class User
    {
        required public string Id { get; set; }
        required public string Username { get; set; }
        required public string Email { get; set; }
        required public string Password { get; set; }
        public string Description { get; set; } = string.Empty;
        public double AmountInUsd { get; set; }
        public double AmountInLbn { get; set; }
        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        public List<Transaction> Transaction { get; set; } = new List<Transaction>();
    }
}