import React, { useState, useEffect } from 'react';
import { useUser } from '../Contexts/UserContext';
import axios from 'axios';
import { X } from 'lucide-react';

const Home = () => {
    const { user } = useUser();
    const [usdBalance, setUsdBalance] = useState(user?.amountInUsd ?? 1250.75);
    const [lbpBalance, setLbpBalance] = useState(user?.amountInLbn ?? 2500000);
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('Expenses');
    const [currency, setCurrency] = useState('USD');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    const exchangeRate = 89000;

    // Fetch transactions on component mount
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoadingTransactions(true);
            const response = await axios.get(
                `${process.env.REACT_APP_ENDPOINT_ROUTES}/api/transaction/getTransactions`,
                { withCredentials: true }
            );
            setTransactions(response.data.transactions || response.data || []);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const formatCurrency = (amount, currency) => {
        if (currency === 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            }).format(amount);
        } else {
            return new Intl.NumberFormat('en-LB', {
                style: 'currency',
                currency: 'LBP',
                minimumFractionDigits: 0
            }).format(amount);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!name || !amount) {
            setError('Name and amount are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_ENDPOINT_ROUTES}/api/transaction/create`,
                {
                    name,
                    type,
                    currency,
                    amount: parseFloat(amount)
                },
                { withCredentials: true }
            );

            console.log('Transaction created:', response.data);

            // Update local balances
            const transactionAmount = parseFloat(amount);
            const multiplier = type === 'Income' ? 1 : -1;

            if (currency === 'USD') {
                setUsdBalance(prev => prev + (transactionAmount * multiplier));
                setLbpBalance(prev => prev + (transactionAmount * exchangeRate * multiplier));
            } else {
                setLbpBalance(prev => prev + (transactionAmount * multiplier));
                setUsdBalance(prev => prev + ((transactionAmount / exchangeRate) * multiplier));
            }

            // Reset form
            setName('');
            setType('Expenses');
            setCurrency('USD');
            setAmount('');
            setShowAddTransaction(false);

            // Refresh transactions list
            fetchTransactions();
        } catch (err) {
            console.error('Transaction error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to create transaction. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const displayedTransactions = showAllTransactions ? [...transactions].reverse() : [...transactions].reverse().slice(0, 5);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#1C1917',
            color: '#F5F5F4',
            padding: '1.5rem',
            position: 'relative'
        }}>
            <div style={{
                maxWidth: '64rem',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '0.5rem',
                        color: '#F5F5F4'
                    }}>
                        Financial Tracker
                    </h1>
                    <p style={{
                        color: '#A8A29E',
                        textAlign: 'center'
                    }}>
                        Manage your finances across currencies
                    </p>
                </div>

                {/* Balance Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {/* USD Balance */}
                    <div style={{
                        background: '#292524',
                        border: '1px solid #44403C',
                        padding: '1.5rem',
                        borderRadius: '0.75rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#E7E5E4'
                            }}>USD Balance</h2>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                background: '#44403C',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                color: '#D6D3D1'
                            }}>
                                $
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '1.875rem',
                                fontWeight: 'bold',
                                color: '#F5F5F4',
                                marginBottom: '0.5rem'
                            }}>
                                {formatCurrency(user?.usdBalance ?? usdBalance, 'USD')}
                            </div>
                            <div style={{
                                color: '#A8A29E',
                                fontSize: '0.875rem'
                            }}>
                                ≈ {formatCurrency((user?.usdBalance ?? usdBalance) * exchangeRate, 'LBP')}
                            </div>
                        </div>
                    </div>

                    {/* LBP Balance */}
                    <div style={{
                        background: '#292524',
                        border: '1px solid #44403C',
                        padding: '1.5rem',
                        borderRadius: '0.75rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#E7E5E4'
                            }}>LBP Balance</h2>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                background: '#44403C',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                color: '#D6D3D1'
                            }}>
                                ل.ل
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '1.875rem',
                                fontWeight: 'bold',
                                color: '#F5F5F4',
                                marginBottom: '0.5rem'
                            }}>
                                {formatCurrency(user?.lbpBalance ?? lbpBalance, 'LBP')}
                            </div>
                            <div style={{
                                color: '#A8A29E',
                                fontSize: '0.875rem'
                            }}>
                                ≈ {formatCurrency((user?.lbpBalance ?? lbpBalance) / exchangeRate, 'USD')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exchange Rate */}
                <div style={{
                    background: '#292524',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        color: '#A8A29E',
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem'
                    }}>
                        Current Exchange Rate
                    </div>
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#F5F5F4'
                    }}>
                        1 USD = {exchangeRate.toLocaleString()} LBP
                    </div>
                </div>

                {/* Add Transaction Button */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <button
                        onClick={() => setShowAddTransaction(true)}
                        style={{
                            background: '#E11D48',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            borderRadius: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#BE185D'}
                        onMouseOut={(e) => e.target.style.background = '#E11D48'}
                    >
                        Add Transaction
                    </button>
                </div>

                {/* Transactions List */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#E7E5E4'
                        }}>
                            Recent Transactions
                        </h3>
                        {transactions.length > 5 && (
                            <button
                                onClick={() => setShowAllTransactions(!showAllTransactions)}
                                style={{
                                    background: 'transparent',
                                    color: '#E11D48',
                                    border: '1px solid #E11D48',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = '#E11D48';
                                    e.target.style.color = '#FFFFFF';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#E11D48';
                                }}
                            >
                                {showAllTransactions ? 'Show Recent Only' : `Show All (${transactions.length})`}
                            </button>
                        )}
                    </div>
                    
                    {loadingTransactions ? (
                        <div style={{
                            textAlign: 'center',
                            color: '#A8A29E',
                            padding: '2rem',
                            background: '#292524',
                            borderRadius: '0.75rem',
                            fontStyle: 'italic'
                        }}>
                            Loading transactions...
                        </div>
                    ) : displayedTransactions.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            color: '#A8A29E',
                            padding: '2rem',
                            background: '#292524',
                            borderRadius: '0.75rem',
                            fontStyle: 'italic'
                        }}>
                            No transactions found
                        </div>
                    ) : (
                        <div style={{
                            background: '#292524',
                            border: '1px solid #44403C',
                            borderRadius: '0.75rem',
                            overflow: 'hidden'
                        }}>
                            {displayedTransactions.map((transaction, index) => (
                                <div key={transaction.id || index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem 1.5rem',
                                    borderBottom: index < displayedTransactions.length - 1 ? '1px solid #44403C' : 'none',
                                    transition: 'background-color 0.2s ease'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem'
                                    }}>
                                        <div style={{
                                            fontWeight: '600',
                                            color: '#F5F5F4',
                                            fontSize: '1rem'
                                        }}>
                                            {transaction.name}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.75rem',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.025em',
                                                background: transaction.type === 'Income' ? '#16A34A' : '#DC2626',
                                                color: '#FFFFFF'
                                            }}>
                                                {transaction.type}
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: '#A8A29E',
                                                fontWeight: '500',
                                                background: '#44403C',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem'
                                            }}>
                                                {transaction.currency}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        fontSize: '1.125rem',
                                        color: transaction.type === 'Income' ? '#16A34A' : '#DC2626'
                                    }}>
                                        {transaction.type === 'Income' ? '+' : '-'}
                                        {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr 1fr' : '1fr',
                    gap: '1rem'
                }}>
                    <div style={{
                        background: '#292524',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            color: '#A8A29E',
                            fontSize: '0.875rem',
                            marginBottom: '0.25rem'
                        }}>
                            Total Balance
                        </div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: '#F5F5F4'
                        }}>
                            {formatCurrency(usdBalance + (lbpBalance / exchangeRate), 'USD')}
                        </div>
                    </div>
                    <div style={{
                        background: '#292524',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            color: '#A8A29E',
                            fontSize: '0.875rem',
                            marginBottom: '0.25rem'
                        }}>
                            USD Percentage
                        </div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: '#F5F5F4'
                        }}>
                            {((usdBalance / (usdBalance + (lbpBalance / exchangeRate))) * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div style={{
                        background: '#292524',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            color: '#A8A29E',
                            fontSize: '0.875rem',
                            marginBottom: '0.25rem'
                        }}>
                            LBP Percentage
                        </div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: '#F5F5F4'
                        }}>
                            {(((lbpBalance / exchangeRate) / (usdBalance + (lbpBalance / exchangeRate))) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {showAddTransaction && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    {/* Modal Content */}
                    <div style={{
                        background: '#292524',
                        border: '1px solid #44403C',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative'
                    }}>
                        {/* Close Button */}
                        <button
                            onClick={() => setShowAddTransaction(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                color: '#A8A29E',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = '#44403C';
                                e.target.style.color = '#F5F5F4';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#A8A29E';
                            }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            color: '#E7E5E4'
                        }}>
                            Add New Transaction
                        </h3>

                        {error && (
                            <div style={{
                                background: '#FEE2E2',
                                color: '#DC2626',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                textAlign: 'center',
                                fontSize: '0.875rem',
                                border: '1px solid #FECACA'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAddTransaction}>
                            {/* Name */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    color: '#D6D3D1',
                                    fontWeight: '500',
                                    marginBottom: '0.5rem'
                                }}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Transaction name"
                                    required
                                    style={{
                                        width: '100%',
                                        background: '#44403C',
                                        border: '1px solid #57534E',
                                        borderRadius: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        color: '#F5F5F4',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#78716C'}
                                    onBlur={(e) => e.target.style.borderColor = '#57534E'}
                                />
                            </div>

                            {/* Type */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    color: '#D6D3D1',
                                    fontWeight: '500',
                                    marginBottom: '0.5rem'
                                }}>
                                    Type
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: '#44403C',
                                        border: '1px solid #57534E',
                                        borderRadius: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        color: '#F5F5F4',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '3rem'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#78716C'}
                                    onBlur={(e) => e.target.style.borderColor = '#57534E'}
                                >
                                    <option value="Expenses">Expenses</option>
                                    <option value="Income">Income</option>
                                </select>
                            </div>

                            {/* Currency */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    color: '#D6D3D1',
                                    fontWeight: '500',
                                    marginBottom: '0.5rem'
                                }}>
                                    Currency
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: '#44403C',
                                        border: '1px solid #57534E',
                                        borderRadius: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        color: '#F5F5F4',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '3rem'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#78716C'}
                                    onBlur={(e) => e.target.style.borderColor = '#57534E'}
                                >
                                    <option value="USD">USD</option>
                                    <option value="LBP">LBP</option>
                                </select>
                            </div>

                            {/* Amount */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    color: '#D6D3D1',
                                    fontWeight: '500',
                                    marginBottom: '0.5rem'
                                }}>
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    required
                                    style={{
                                        width: '100%',
                                        background: '#44403C',
                                        border: '1px solid #57534E',
                                        borderRadius: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        color: '#F5F5F4',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#78716C'}
                                    onBlur={(e) => e.target.style.borderColor = '#57534E'}
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddTransaction(false)}
                                    style={{
                                        background: 'transparent',
                                        color: '#A8A29E',
                                        border: '1px solid #57534E',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.75rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.background = '#44403C';
                                        e.target.style.color = '#F5F5F4';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = '#A8A29E';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        background: loading ? '#78716C' : '#E11D48',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.75rem',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        if (!loading) e.target.style.background = '#BE185D';
                                    }}
                                    onMouseOut={(e) => {
                                        if (!loading) e.target.style.background = '#E11D48';
                                    }}
                                >
                                    {loading ? 'Creating Transaction...' : 'Add Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;