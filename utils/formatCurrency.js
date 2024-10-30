function formatCurrency(amount, currency = 'INR') {
    const symbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };

    return `${symbols[currency]}${amount.toLocaleString('en-IN')}`;
}

module.exports = formatCurrency; 