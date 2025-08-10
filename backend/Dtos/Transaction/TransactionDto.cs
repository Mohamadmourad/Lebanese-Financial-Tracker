using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Transaction
{
    public class TransactionDto
    {
        required public string Name { get; set; }
        required public string Type { get; set; }
        required public string Currency { get; set; }
        public double Amount { get; set; }
    }
}