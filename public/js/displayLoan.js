document.addEventListener('htmx:afterOnLoad', function() {
  function calculateLoan() {
    const loanAmount = parseInt(document.getElementById('amount').value);
    const installments = parseInt(document.getElementById('days').value);
    const annualInterestRate = 0.26; // 26% annual interest rate
    const adminFee = 0.1; // 10% administrative fee
    const commission = 0.18; // 18% commission

    const monthlyInterestRate = annualInterestRate / 12;
    const totalLoanAmount = loanAmount + loanAmount * (adminFee + commission);
    const monthlyPayment = (totalLoanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -installments));
    const totalInterest = monthlyPayment * installments - totalLoanAmount;
    const effectiveAnnualRate = Math.pow(1 + monthlyInterestRate, 12) - 1;

    document.getElementById('loanOutput').textContent = loanAmount.toLocaleString();
    document.getElementById('monthsOutput').textContent = installments;
    document.getElementById('interest-rate').textContent = (annualInterestRate * 100).toFixed(2) + '%';
    document.getElementById('apr').textContent = (effectiveAnnualRate * 100).toFixed(2) + '%';
    document.getElementById('amount2').textContent = monthlyPayment.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' });
  }

  document.getElementById('loan-calculator-component').addEventListener('input', function(event) {
    if (event.target.id === 'amount' || event.target.id === 'days') {
      calculateLoan();
    }
  });

  // Initial calculation
  calculateLoan();
});