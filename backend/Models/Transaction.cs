using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class Transaction
    {
        required public string Id { get; set; }
        required public string Name { get; set; }
        required public string Type { get; set; }
        required public string Currency { get; set; }
        
        public double Amount { get; set; }

        public string? UserId { get; set; }
        public User? User { get; set; }
        public DateTime Created_At { get; set; } = DateTime.UtcNow;

    }
}