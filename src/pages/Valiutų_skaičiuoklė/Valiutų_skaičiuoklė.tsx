import React, { useState, useEffect } from 'react';
import { currencyAPI } from '../../shared/api/index';
import DeleteButton from '../../components/atoms/DeleteButton';
import Input from '../../components/atoms/Input/Input';
import {
  StyledBox,
  StyledBoxLeft,
  StyledBoxRight,
  StyledSelect,
  StyledTitle,
  StyledWrapper,
} from './styles';

const CurrencyCalculator = () => {
  const [baseCurrency, setBaseCurrency] = useState('');
  const [baseValue, setBaseValue] = useState('');
  const [initialCurrencyRates, setInitialCurrencyRates] = useState<{
    [key: string]: number;
  }>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [displayedCurrencies, setDisplayedCurrencies] = useState<string[]>([]);
  const [dateValue, setDateValue] = useState('');

  const handleBaseCurrencyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const currency = e.target.value;
    setBaseCurrency(currency);
  };

  const handleBaseValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBaseValue(value);
  };

  const handleCurrencySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = e.target.value;
    setSelectedCurrency(currency);
  };

  const handleCurrencyRemoval = (currency: string) => {
    setDisplayedCurrencies((prevCurrencies) =>
      prevCurrencies.filter((c) => c !== currency)
    );
  };

  const calculateCurrencyValues = () => {
    const parsedValue = parseFloat(baseValue.replace(',', '.')) || 0;

    const calculatedCurrencyValues = Object.entries(
      initialCurrencyRates
    ).reduce((result, [currency, rate]) => {
      result[currency] =
        (parsedValue * rate) / initialCurrencyRates[baseCurrency];
      return result;
    }, {} as { [key: string]: number });

    return calculatedCurrencyValues;
  };

  useEffect(() => {
    const fetchCurrencyRates = async () => {
      try {
        const data = await currencyAPI.getCurrency();
        setInitialCurrencyRates(data);
        setBaseCurrency(Object.keys(data)[0]);
        const randomCurrencies = getRandomCurrencies(Object.keys(data), 5); // Set count to 5
        setDisplayedCurrencies(randomCurrencies);
      } catch (error) {
        console.error('Error fetching currency rates:', error);
      }
    };

    fetchCurrencyRates();
  }, []);

  useEffect(() => {
    fetch(
      'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur.json'
    )
      .then((response) => response.json())
      .then((data) => {
        const formattedDate = data.date.toString();
        setDateValue(formattedDate);
      })
      .catch((error) => {
        console.error('Error fetching currency data:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedCurrency && !displayedCurrencies.includes(selectedCurrency)) {
      setDisplayedCurrencies((prevCurrencies) => [
        ...prevCurrencies,
        selectedCurrency,
      ]);
      setSelectedCurrency('');
    }
  }, [selectedCurrency, displayedCurrencies]);

  const calculatedCurrencyValues = {
    ...calculateCurrencyValues(),
    [baseCurrency]: parseFloat(baseValue.replace(',', '.')) || 0,
  };

  const getRandomCurrencies = (currencies: string[], count: number) => {
    const shuffledCurrencies = currencies.sort(() => 0.5 - Math.random());
    return shuffledCurrencies.slice(0, count);
  };

  return (
    <StyledWrapper>
      <StyledBox>
        {' '}
        <StyledBoxLeft>
          {' '}
          <div>Data: {dateValue}</div>
          <div>
            <h3>Bazinė valiuta:</h3>
            <StyledSelect
              value={baseCurrency}
              onChange={handleBaseCurrencyChange}
            >
              {Object.keys(initialCurrencyRates).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </StyledSelect>
          </div>
          <div>
            <h3>Suma:</h3>
            <div className='input'>
              <Input
                type='text'
                value={baseValue}
                onChange={handleBaseValueChange}
                setvalue={setBaseValue}
              />
            </div>
          </div>
          <div>
            <h3>Pridėti valiutą:</h3>
            <StyledSelect
              value={selectedCurrency}
              onChange={handleCurrencySelection}
            >
              <option value='' disabled>
                Pasirinkite valiutą
              </option>
              {Object.keys(initialCurrencyRates).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </StyledSelect>
          </div>
        </StyledBoxLeft>
        <StyledBoxRight>
          <h3>Valiutos:</h3>
          {displayedCurrencies.map((currency) => (
            <div key={currency}>
              <div className='input-right'>
                <div className='input-right-c'>
                  <StyledTitle className='currencyTitle'>
                    {currency}:{' '}
                  </StyledTitle>
                </div>
                <div className='input-right-w'>
                  <Input
                    type='text'
                    value={(calculatedCurrencyValues[currency] || 0).toFixed(2)}
                    readOnly
                  />
                </div>
                <DeleteButton onClick={() => handleCurrencyRemoval(currency)} />
              </div>
            </div>
          ))}
        </StyledBoxRight>
      </StyledBox>
    </StyledWrapper>
  );
};

export default CurrencyCalculator;
