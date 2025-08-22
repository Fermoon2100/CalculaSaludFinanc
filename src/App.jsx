import React, { useState } from 'react';

// Main App component for the Financial Health Analyzer
const App = () => {
  // State for input fields
  const [companyTicker, setCompanyTicker] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD'); // New: Currency selector
  const [reportDate, setReportDate] = useState('');
  const [currentAssets, setCurrentAssets] = useState('');
  const [currentLiabilities, setCurrentLiabilities] = useState('');
  const [totalAssets, setTotalAssets] = useState('');
  const [totalLiabilities, setTotalLiabilities] = useState('');
  const [shareholdersEquity, setShareholdersEquity] = useState('');
  const [inventory, setInventory] = useState('');

  // State for calculated ratios and error messages
  const [currentRatio, setCurrentRatio] = useState(null);
  const [currentRatioInterpretation, setCurrentRatioInterpretation] = useState('');
  const [quickRatio, setQuickRatio] = useState(null);
  const [quickRatioInterpretation, setQuickRatioInterpretation] = useState('');
  const [debtToEquityRatio, setDebtToEquityRatio] = useState(null);
  const [debtToEquityInterpretation, setDebtToEquityInterpretation] = useState('');
  const [debtToAssetsRatio, setDebtToAssetsRatio] = useState(null);
  const [debtToAssetsInterpretation, setDebtToAssetsInterpretation] = useState('');
  const [error, setError] = useState('');

  // Full disclaimer text
  const fullDisclaimerText = "Estos rangos son guías generales. La interpretación precisa debe considerar la industria y las tendencias históricas de la empresa. El análisis completo y la decisión de invertir o no es responsabilidad absoluta de cada usuario, por lo que los resultados de esta herramienta no deben ser considerados por sí mismos una recomendación de inversión.";

  /**
   * Returns the currency symbol based on the selected currency code.
   * @param {string} currencyCode - The currency code (e.g., 'USD', 'MXN').
   * @returns {string} - The corresponding currency symbol.
   */
  const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
      case 'USD': return '$';
      case 'MXN': return 'MXN$';
      case 'EUR': return '€';
      case 'JPY': return '¥';
      case 'GBP': return '£';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      case 'CHF': return 'CHF';
      case 'CNY': return '¥'; // Chinese Yuan also uses ¥, distinct from JPY by context
      case 'INR': return '₹';
      case 'BRL': return 'R$';
      case 'RUB': return '₽';
      case 'ZAR': return 'R';
      default: return '';
    }
  };

  /**
   * Returns the interpretation string and emoji for Current Ratio.
   * @param {number} ratio - The calculated Current Ratio.
   * @returns {string} - Interpretation string.
   */
  const getCurrentRatioInterpretation = (ratio) => {
    if (typeof ratio !== 'number' || isNaN(ratio)) return '';
    if (ratio > 2.0) return 'Excelente 🚀';
    if (ratio >= 1.5) return 'Bueno 👍';
    if (ratio >= 1.0) return 'Regular 😐';
    if (ratio >= 0.5) return 'Malo 🚩';
    return 'Pésimo 🚨';
  };

  /**
   * Returns the interpretation string and emoji for Quick Ratio.
   * @param {number} ratio - The calculated Quick Ratio.
   * @returns {string} - Interpretation string.
   */
  const getQuickRatioInterpretation = (ratio) => {
    if (typeof ratio !== 'number' || isNaN(ratio)) return '';
    if (ratio > 1.5) return 'Excelente 🚀';
    if (ratio >= 1.0) return 'Bueno 👍';
    if (ratio >= 0.7) return 'Regular 😐';
    if (ratio >= 0.3) return 'Malo 🚩';
    return 'Pésimo 🚨';
  };

  /**
   * Returns the interpretation string and emoji for Debt-to-Equity Ratio.
   * @param {number} ratio - The calculated Debt-to-Equity Ratio.
   * @returns {string} - Interpretation string.
   */
  const getDebtToEquityInterpretation = (ratio) => {
    if (typeof ratio !== 'number' || isNaN(ratio)) return '';
    if (ratio < 0.5) return 'Excelente 🚀';
    if (ratio >= 0.5 && ratio <= 1.0) return 'Bueno 👍';
    if (ratio > 1.0 && ratio <= 2.0) return 'Regular 😐';
    if (ratio > 2.0 && ratio <= 5.0) return 'Malo 🚩';
    return 'Pésimo 🚨';
  };

  /**
   * Returns the interpretation string and emoji for Debt-to-Assets Ratio.
   * @param {number} ratio - The calculated Debt-to-Assets Ratio.
   * @returns {string} - Interpretation string.
   */
  const getDebtToAssetsInterpretation = (ratio) => {
    if (typeof ratio !== 'number' || isNaN(ratio)) return '';
    if (ratio < 0.30) return 'Excelente 🚀';
    if (ratio >= 0.30 && ratio <= 0.50) return 'Bueno 👍';
    if (ratio > 0.50 && ratio <= 0.70) return 'Regular 😐';
    if (ratio > 0.70 && ratio <= 0.90) return 'Malo 🚩';
    return 'Pésimo 🚨';
  };


  /**
   * Handles numeric input changes for display, allowing commas for thousands.
   * Stores the raw numeric string (without commas) in state for calculations.
   * @param {object} e - The event object from the input.
   * @param {function} setter - The state setter function for the specific input.
   */
  const handleDisplayNumericInputChange = (e, setter) => {
    const inputVal = e.target.value;
    // Allow digits, a single decimal point, and negative sign. Remove commas.
    const cleanedForStorage = inputVal.replace(/,/g, '').replace(/[^0-9.-]/g, '');
    setter(cleanedForStorage); // Store the cleaned, unformatted number string
  };

  /**
   * Formats a raw numeric string for display with thousand separators and conditional decimal places.
   * Uses 'en-US' locale for consistent comma thousands separator and dot decimal separator.
   * @param {string} numValue - The raw numeric string (e.g., "1234567.89") from state.
   * @returns {string} - The formatted string (e.g., "1,234,567.89" or "1,234,567").
   */
  const formatDisplayNumber = (numValue) => {
    // Ensure numValue is safely converted to a string to use .includes()
    const numString = String(numValue);

    if (numString === '') return ''; // Handle empty input gracefully

    // Convert to number for formatting, but keep original string to check for explicit decimals
    const num = parseFloat(numString);
    if (isNaN(num)) return numString; // Return original string if not a valid number yet (e.g., just a '-')

    // Check if the original string explicitly contains a decimal point
    const hasCentsExplicitly = numString.includes('.');

    return num.toLocaleString('en-US', { // Explicitly set locale to en-US for comma thousands and dot decimal
      minimumFractionDigits: hasCentsExplicitly ? 2 : 0, // Show 2 decimal places if '.' was entered, else 0
      maximumFractionDigits: 2 // Always limit to 2 decimal places
    });
  };

  /**
   * Formats a date string from 'YYYY-MM-DD' to 'DD-MMM-YYYY'.
   * @param {string} dateString - The date in 'YYYY-MM-DD' format.
   * @returns {string} - The formatted date in 'DD-MMM-YYYY' format.
   */
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    // Simple parsing for DD-MMM-YYYY. Assumes valid input.
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, monthStr, year] = parts;
      const monthNames = {
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
      };
      const monthNum = monthNames[monthStr.toLowerCase()];
      if (monthNum) {
        return `${day}-${monthStr}-${year}`; // Return as is if already in desired format
      }
    }
    // Fallback for YYYY-MM-DD from date picker or other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Invalid date string

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    const monthNamesShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${day}-${monthNamesShort[month]}-${year}`;
  };

  /**
   * Handles date input in 'DD-MMM-YYYY' format.
   * @param {object} e - The event object from the input.
   */
  const handleDateInputChange = (e) => {
    const inputVal = e.target.value;
    setReportDate(inputVal);
  };

  /**
   * Calculates the financial ratios based on user inputs.
   */
  const calculateRatios = () => {
    setError('');
    setCurrentRatio(null);
    setQuickRatio(null);
    setDebtToEquityRatio(null);
    setDebtToAssetsRatio(null);
    setCurrentRatioInterpretation('');
    setQuickRatioInterpretation('');
    setDebtToEquityInterpretation('');
    setDebtToAssetsInterpretation('');

    const numCurrentAssets = parseFloat(currentAssets);
    const numCurrentLiabilities = parseFloat(currentLiabilities);
    const numTotalAssets = parseFloat(totalAssets);
    const numTotalLiabilities = parseFloat(totalLiabilities);
    const numShareholdersEquity = parseFloat(shareholdersEquity);
    const numInventory = parseFloat(inventory); // Get inventory for Quick Ratio

    // Basic validation for all required fields
    if (isNaN(numCurrentAssets) || isNaN(numCurrentLiabilities) || isNaN(numTotalAssets) ||
        isNaN(numTotalLiabilities) || isNaN(numShareholdersEquity) || isNaN(numInventory)) {
      setError('Por favor, ingrese valores numéricos válidos en todos los campos.');
      return;
    }

    // --- Liquidez Ratios ---
    // Current Ratio
    let calculatedCurrentRatio = null;
    if (numCurrentLiabilities !== 0) {
      calculatedCurrentRatio = (numCurrentAssets / numCurrentLiabilities);
      setCurrentRatio(calculatedCurrentRatio.toFixed(2));
      setCurrentRatioInterpretation(getCurrentRatioInterpretation(calculatedCurrentRatio));
    } else {
      setCurrentRatio('N/A');
      setCurrentRatioInterpretation('Pasivos Circulantes es cero');
    }

    // Quick Ratio
    let calculatedQuickRatio = null;
    if (numCurrentLiabilities !== 0) {
      calculatedQuickRatio = ((numCurrentAssets - numInventory) / numCurrentLiabilities);
      setQuickRatio(calculatedQuickRatio.toFixed(2));
      setQuickRatioInterpretation(getQuickRatioInterpretation(calculatedQuickRatio));
    } else {
      setQuickRatio('N/A');
      setQuickRatioInterpretation('Pasivos Circulantes es cero');
    }


    // --- Solvencia / Apalancamiento Ratios ---
    // Debt-to-Equity Ratio
    let calculatedDebtToEquityRatio = null;
    if (numShareholdersEquity !== 0) {
      calculatedDebtToEquityRatio = (numTotalLiabilities / numShareholdersEquity);
      setDebtToEquityRatio(calculatedDebtToEquityRatio.toFixed(2));
      setDebtToEquityInterpretation(getDebtToEquityInterpretation(calculatedDebtToEquityRatio));
    } else {
      setDebtToEquityRatio('N/A');
      setDebtToEquityInterpretation('Patrimonio Neto es cero');
    }

    // Debt-to-Assets Ratio
    let calculatedDebtToAssetsRatio = null;
    if (numTotalAssets !== 0) {
      calculatedDebtToAssetsRatio = (numTotalLiabilities / numTotalAssets);
      setDebtToAssetsRatio(calculatedDebtToAssetsRatio.toFixed(2));
      setDebtToAssetsInterpretation(getDebtToAssetsInterpretation(calculatedDebtToAssetsRatio));
    } else {
      setDebtToAssetsRatio('N/A');
      setDebtToAssetsInterpretation('Activos Totales es cero');
    }
  };

  /**
   * Clears all input fields and calculated results.
   */
  const handleClearForm = () => {
    setCompanyTicker('');
    setSelectedCurrency('USD'); // Reset currency
    setReportDate('');
    setCurrentAssets('');
    setCurrentLiabilities('');
    setTotalAssets('');
    setTotalLiabilities('');
    setShareholdersEquity('');
    setInventory('');
    setCurrentRatio(null);
    setQuickRatio(null);
    setDebtToEquityRatio(null);
    setDebtToAssetsRatio(null);
    setCurrentRatioInterpretation('');
    setQuickRatioInterpretation('');
    setDebtToEquityInterpretation('');
    setDebtToAssetsInterpretation('');
    setError('');
  };

  /**
   * Handles printing the report using an iframe to ensure content is rendered.
   */
  const handlePrint = () => {
    const printableContent = document.getElementById('printable-content');
    if (!printableContent) {
      console.error('No se encontró el elemento #printable-content para imprimir.');
      return;
    }

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;

    // Copy the content to be printed into the iframe
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Informe de Salud Financiera</title>
        <style>
          /* Basic print styles for the iframe */
          body {
            font-family: sans-serif;
            margin: 20mm; /* Standard margin for print */
            background-color: white !important;
            color: black !important;
          }
          #printable-content {
            width: 100%;
            padding: 0;
            box-shadow: none;
            background-color: white !important;
            color: black !important;
          }
          #printable-content * {
            color: black !important;
            background-color: transparent !important;
            box-shadow: none !important;
            text-shadow: none !important;
            border-color: #ccc !important;
          }
          h1, h2, h3, p, ul, li, span {
            color: black !important;
          }
          .flex.justify-center.mb-4.print-only { /* Ensure logo is centered */
            display: flex;
            justify-content: center;
            margin-bottom: 1rem;
          }
          .text-center {
            text-align: center;
          }
          .mb-4 { margin-bottom: 1rem; }
          .mt-2 { margin-top: 0.5rem; }
          .mt-8 { margin-top: 2rem; }
          .pt-6 { padding-top: 1.5rem; }
          .border-t { border-top: 1px solid #ccc; }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .text-base { font-size: 1rem; line-height: 1.5rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .rounded-full { border-radius: 9999px; }
          .bg-teal-600 { background-color: #0D9488; } /* Tailwind teal-600 */
          .text-teal-400 { color: #2DD4BF; } /* Tailwind teal-400 */
          .text-teal-300 { color: #5EEAD4; } /* Tailwind teal-300 */
          .text-gray-200 { color: #E5E7EB; } /* Tailwind gray-200 */
          .text-gray-300 { color: #D1D5DB; } /* Tailwind gray-300 */
          .text-gray-400 { color: #9CA3AF; } /* Tailwind gray-400 */
          .text-gray-500 { color: #6B7280; } /* Tailwind gray-500 */
          .list-disc { list-style-type: disc; }
          .list-inside { list-style-position: inside; }
          .ml-2 { margin-left: 0.5rem; }
        </style>
      </head>
      <body>
        ${printableContent.innerHTML}
      </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for content to load, then print
    iframe.contentWindow.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe); // Remove iframe after printing
    };
  };

  const currencySymbol = getCurrencySymbol(selectedCurrency);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* The main style block is now only for screen view, print styles are injected into iframe */}
      <style>
        {`
        /* Hide print-only elements by default on screen view */
        .print-only {
          display: none;
        }
        `}
      </style>
      <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-4 hide-on-print">
          <svg width="100" height="100" viewBox="0 0 100 100" className="rounded-full bg-teal-600">
            <rect width="100" height="100" rx="50" ry="50" fill="#00796B" />
            <text x="50%" y="40%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Salud</text>
            <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Financiera</text>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-center text-teal-400 mb-6 hide-on-print">
          Analizador de Salud Financiera
        </h1>

        {/* Company Ticker Input */}
        <div className="mb-4 hide-on-print">
          <label htmlFor="companyTicker" className="block text-sm font-medium text-gray-300 mb-1">
            Ticker de la Empresa:
          </label>
          <input
            type="text"
            id="companyTicker"
            value={companyTicker}
            onChange={(e) => setCompanyTicker(e.target.value.toUpperCase())}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Ej: BIMBOA"
          />
        </div>

        {/* Currency Selector */}
        <div className="mb-4 hide-on-print">
          <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-1">
            Moneda de los Datos:
          </label>
          <select
            id="currency"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="USD">Dólar Estadounidense (USD)</option>
            <option value="MXN">Peso Mexicano (MXN)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="JPY">Yen Japonés (JPY)</option>
            <option value="GBP">Libra Esterlina (GBP)</option>
            <option value="CAD">Dólar Canadiense (CAD)</option>
            <option value="AUD">Dólar Australiano (AUD)</option>
            <option value="CHF">Franco Suizo (CHF)</option>
            <option value="CNY">Yuan Chino (CNY)</option>
            <option value="INR">Rupia India (INR)</option>
            <option value="BRL">Real Brasileño (BRL)</option>
            <option value="RUB">Rublo Ruso (RUB)</option>
            <option value="ZAR">Rand Sudafricano (R)</option>
          </select>
        </div>

        {/* Report Date Input */}
        <div className="mb-4 hide-on-print">
          <label htmlFor="reportDate" className="block text-sm font-medium text-gray-300 mb-1">
            Fecha del Informe (DD-MMM-AAAA):
          </label>
          <input
            type="text" // Changed to text to allow DD-MMM-AAAA input
            id="reportDate"
            value={reportDate}
            onChange={handleDateInputChange}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Ej: 31-dic-2024"
          />
        </div>

        {/* Input fields for Balance Sheet data */}
        <div className="space-y-4 mb-6 hide-on-print">
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Datos del Balance General:</h2>
          <div>
            <label htmlFor="currentAssets" className="block text-sm font-medium text-gray-300 mb-1">
              Activos Circulantes:
            </label>
            <input
              type="text"
              id="currentAssets"
              value={formatDisplayNumber(currentAssets)}
              onChange={(e) => handleDisplayNumericInputChange(e, setCurrentAssets)}
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ej: 150,000,000"
            />
          </div>
          <div>
            <label htmlFor="currentLiabilities" className="block text-sm font-medium text-gray-300 mb-1">
              Pasivos Circulantes:
            </label>
            <input
              type="text"
              id="currentLiabilities"
              value={formatDisplayNumber(currentLiabilities)}
              onChange={(e) => handleDisplayNumericInputChange(e, setCurrentLiabilities)}
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ej: 80,000,000"
            />
          </div>
          <div>
            <label htmlFor="inventory" className="block text-sm font-medium text-gray-300 mb-1">
              Inventario:
            </label>
            <input
              type="text"
              id="inventory"
              value={formatDisplayNumber(inventory)}
              onChange={(e) => handleDisplayNumericInputChange(e, setInventory)}
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ej: 30,000,000"
            />
          </div>
          <div>
            <label htmlFor="totalAssets" className="block text-sm font-medium text-gray-300 mb-1">
              Activos Totales:
            </label>
            <input
              type="text"
              id="totalAssets"
              value={formatDisplayNumber(totalAssets)}
              onChange={(e) => handleDisplayNumericInputChange(e, setTotalAssets)}
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ej: 500,000,000"
            />
          </div>
          <div>
            <label htmlFor="totalLiabilities" className="block text-sm font-medium text-gray-300 mb-1">
              Pasivos Totales:
            </label>
            <input
              type="text"
              id="totalLiabilities"
              value={formatDisplayNumber(totalLiabilities)}
              onChange={(e) => handleDisplayNumericInputChange(e, setTotalLiabilities)}
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ej: 300,000,000"
            />
          </div>
          <div>
            <label htmlFor="shareholdersEquity" className="block text-sm font-medium text-gray-300 mb-1">
              Patrimonio Neto:
            </label>
            <input
              type="text"
              id="shareholdersEquity"
              value={formatDisplayNumber(shareholdersEquity)}
              onChange={(e) => handleDisplayNumericInputChange(e, setShareholdersEquity)}
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ej: 200,000,000"
            />
          </div>
        </div>

        {/* Calculate button */}
        <button
          onClick={calculateRatios}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 hide-on-print"
        >
          Calcular Ratios
        </button>

        {/* Error message display */}
        {error && (
          <div className="mt-4 p-3 bg-red-800 text-red-200 rounded-md text-center hide-on-print">
            {error}
          </div>
        )}

        {/* Display results */}
        {currentRatio !== null && !error && (
          <div id="printable-content" className="mt-6 p-4 bg-gray-700 rounded-md">
            {/* Logo and Title for Print */}
            <div className="flex justify-center mb-4 print-only">
              <svg width="100" height="100" viewBox="0 0 100 100" className="rounded-full bg-teal-600">
                <rect width="100" height="100" rx="50" ry="50" fill="#00796B" />
                <text x="50%" y="40%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Salud</text>
                <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Financiera</text>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-center text-teal-400 mb-6 print-only">
              Analizador de Salud Financiera
            </h1>

            {companyTicker && (
              <h2 className="text-xl font-semibold text-gray-200 text-center mb-4">
                Resultados para: <span className="text-teal-300">{companyTicker}</span>
              </h2>
            )}
            {reportDate && (
              <p className="text-sm text-gray-300 text-center mb-4">
                Fecha del Informe: {formatDateForDisplay(reportDate)}
              </p>
            )}
            <p className="text-sm text-gray-300 text-center mb-4">
                Moneda de los Datos: {selectedCurrency}
            </p>

            <h3 className="text-lg font-medium text-teal-300 mb-2">Datos Ingresados:</h3>
            <p className="text-base text-gray-200">
              <span className="font-semibold">Activos Circulantes:</span> {formatDisplayNumber(currentAssets)} {getCurrencySymbol(selectedCurrency)}
            </p>
            <p className="text-base text-gray-200">
              <span className="font-semibold">Pasivos Circulantes:</span> {formatDisplayNumber(currentLiabilities)} {getCurrencySymbol(selectedCurrency)}
            </p>
            <p className="text-base text-gray-200">
              <span className="font-semibold">Inventario:</span> {formatDisplayNumber(inventory)} {getCurrencySymbol(selectedCurrency)}
            </p>
            <p className="text-base text-gray-200">
              <span className="font-semibold">Activos Totales:</span> {formatDisplayNumber(totalAssets)} {getCurrencySymbol(selectedCurrency)}
            </p>
            <p className="text-base text-gray-200">
              <span className="font-semibold">Pasivos Totales:</span> {formatDisplayNumber(totalLiabilities)} {getCurrencySymbol(selectedCurrency)}
            </p>
            <p className="text-base text-gray-200 mb-4">
              <span className="font-semibold">Patrimonio Neto:</span> {formatDisplayNumber(shareholdersEquity)} {getCurrencySymbol(selectedCurrency)}
            </p>

            <h3 className="text-lg font-medium text-teal-300 mb-2">Ratios de Liquidez:</h3>
            <p className="text-base text-gray-200">
              <span className="font-semibold">Ratio de Liquidez:</span> {currentRatio} (Mide la capacidad de la empresa de pagar sus deudas a corto plazo con sus activos más líquidos.) - {currentRatioInterpretation}
            </p>
            <p className="text-base text-gray-200">
              <span className="font-semibold">Ratio de Prueba Ácida:</span> {quickRatio} (Mide la capacidad de la empresa de pagar sus deudas a corto plazo sin depender del inventario.) - {quickRatioInterpretation}
            </p>

            <h3 className="text-lg font-medium text-teal-300 mt-4 mb-2">Ratios de Solvencia / Apalancamiento:</h3>
            <p className="text-base text-gray-200">
              <span className="font-semibold">Ratio de Deuda a Patrimonio Neto:</span> {debtToEquityRatio} (Mide la proporción de la financiación que proviene de la deuda vs. el capital de los dueños.) - {debtToEquityInterpretation}
            </p>
            <p className="text-base text-gray-200">
              <span className="font-semibold">Ratio de Deuda a Activos Totales:</span> {debtToAssetsRatio} (Mide el porcentaje de los activos de la empresa que se financian con deuda.) - {debtToAssetsInterpretation}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3 hide-on-print">
          <button
            onClick={handleClearForm}
            className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
          >
            Limpiar Formulario
          </button>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Imprimir Informe
          </button>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            Guardar como PDF
          </button>
        </div>

        {/* Ratio Interpretation Ranges */}
        <div className="mt-8 text-xs text-gray-400 border-t border-gray-700 pt-6 hide-on-print">
          <h3 className="text-sm font-semibold text-teal-300 mb-2">Guía de Interpretación de Ratios:</h3>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-300">Ratio de Liquidez:</h4>
            <ul className="list-disc list-inside ml-2">
              <li><span className="font-bold">{'>'} 2.0:</span> Excelente 🚀</li>
              <li><span className="font-bold">1.5 - 2.0:</span> Bueno 👍</li>
              <li><span className="font-bold">1.0 - 1.5:</span> Regular 😐</li>
              <li><span className="font-bold">0.5 - 1.0:</span> Malo 🚩</li>
              <li><span className="font-bold">{'<'} 0.5:</span> Pésimo 🚨</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-300">Ratio de Prueba Ácida:</h4>
            <ul className="list-disc list-inside ml-2">
              <li><span className="font-bold">{'>'} 1.5:</span> Excelente 🚀</li>
              <li><span className="font-bold">1.0 - 1.5:</span> Bueno 👍</li>
              <li><span className="font-bold">0.7 - 1.0:</span> Regular 😐</li>
              <li><span className="font-bold">0.3 - 0.7:</span> Malo 🚩</li>
              <li><span className="font-bold">{'<'} 0.3:</span> Pésimo 🚨</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-300">Ratio de Deuda a Patrimonio Neto:</h4>
            <ul className="list-disc list-inside ml-2">
              <li><span className="font-bold">{'<'} 0.5:</span> Excelente 🚀</li>
              <li><span className="font-bold">0.5 - 1.0:</span> Bueno 👍</li>
              <li><span className="font-bold">1.0 - 2.0:</span> Regular 😐</li>
              <li><span className="font-bold">2.0 - 5.0:</span> Malo 🚩</li>
              <li><span className="font-bold">{'>'} 5.0:</span> Pésimo 🚨</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-300">Ratio de Deuda a Activos Totales:</h4>
            <ul className="list-disc list-inside ml-2">
              <li><span className="font-bold">{'<'} 0.30:</span> Excelente 🚀</li>
              <li><span className="font-bold">0.30 - 0.50:</span> Bueno 👍</li>
              <li><span className="font-bold">0.50 - 0.70:</span> Regular 😐</li>
              <li><span className="font-bold">0.70 - 0.90:</span> Malo 🚩</li>
              <li><span className="font-bold">{'>'} 0.90:</span> Pésimo 🚨</li>
            </ul>
          </div>
        </div>

        {/* Combined Disclaimer and Creator Info at the very end */}
        <div className="mt-8 text-xs text-gray-400 text-center final-disclaimer">
          <p>
            *Nota: {fullDisclaimerText}
          </p>
          <p className="mt-2 text-center text-gray-500">
            © 2025 @Fermoon™
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
