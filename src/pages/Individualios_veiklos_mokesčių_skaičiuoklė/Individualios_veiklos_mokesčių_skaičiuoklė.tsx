import React, { useState, useEffect } from 'react';
import Form from '../../components/molecules/Form';
import Display from '../../components/molecules/Display';
import { StyledPage } from '../Atlyginimo_ir_mokesčIų_skaičiuoklė/styles';
import { FormField } from '../../components/molecules/Form/Form';

interface FormValues {
  income: string;
  expenses: string;
  PSD: string;
  VSD: string;
  incomeType: string;
  pension: boolean;
}

const Individualios_veiklos_mokesciu_skaiciuokle: React.FC = () => {
  const fields: FormField[] = [
    {
      key: 'income',
      text: '',
      type: 'number',
      textPlaceholder: 'Įveskite pajamas',
    },
    {
      key: 'expenses',
      text: '',
      type: 'number',
      textPlaceholder: 'Patirtos sąnaudos',
    },
    {
      key: 'PSD',
      text: '',
      type: 'number',
      textPlaceholder: 'Sumokėtas PSD',
    },
    {
      key: 'VSD',
      text: '',
      type: 'number',
      textPlaceholder: 'Sumokėtas VSD',
    },
    {
      key: 'incomeType',
      text: '',
      type: 'radio',
      radioOptions: ['30% nuo pajamų', 'Faktiškai patirtos'],
    },
    {
      key: 'pension',
      text: '',
      type: 'checkbox',
      radioOptions: ['Kaupiu pensijai'],
    },
  ];
  const initialFormValues: FormValues = {
    income: '0',
    expenses: '0',
    PSD: '0',
    VSD: '0',
    incomeType: '30% nuo pajamų',
    pension: false,
  };

  const [displayedValues, setDisplayedValues] =
    useState<FormValues>(initialFormValues);
  const [receivedIncome, setReceivedIncome] = useState<string>('');
  const [benefitsIncurred, setBenefitsIncurred] = useState<string>('');
  const [additionalPension, setAdditionalPension] = useState<boolean>(true);
  const [VSDPercent, setVSDPercent] = useState<string>('12.52%');
  const [VSD, setVSD] = useState<string>('');
  const [PSD, setPSD] = useState<string>('');
  const [GPMPercent, setGPMPercent] = useState<string>('5%');
  const [GPM, setGPM] = useState<string>('');
  const [apmokestinamosPajamos, setApmokestinamosPajamos] =
    useState<string>('');
  const [finalIncome, setFinalIncome] = useState<string>('');
  const [finalTaxes, setFinalTaxes] = useState<string>('');
  const [taxPercent, setTaxPercent] = useState<string>('');

  const handleDisplayValues = (values: any) => {
    setDisplayedValues((prevValues) => ({ ...prevValues, ...values }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDisplayedValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    if (name === 'income') {
      setReceivedIncome(value);
    } else if (name === 'expenses') {
      setBenefitsIncurred(value);
    }
  };

  const handleAdditionalPensionChange = () => {
    setAdditionalPension((prev) => !prev);
    setVSDPercent((prevPercent) =>
      prevPercent === '12.52%' ? '15.52%' : '12.52%'
    );
  };

  const handleOptionChange = () => {
    const selectedOption = displayedValues.incomeType;
    const incomeReceived = receivedIncome;

    if (selectedOption === '30% nuo pajamų') {
      setDisplayedValues((prevValues) => ({
        ...prevValues,
        incomeType: 'Faktiškai patirtos',
      }));

      const consumption = parseFloat(incomeReceived) * 0.3;
      setBenefitsIncurred(
        isNaN(consumption) ? '' : consumption.toFixed(2).toString()
      );
    } else {
      setDisplayedValues((prevValues) => ({
        ...prevValues,
        incomeType: '30% nuo pajamų',
      }));

      setBenefitsIncurred('');
    }
  };

  const calculateProfit = (): number => {
    const income = parseFloat(receivedIncome) || 0;
    const expenses = parseFloat(benefitsIncurred) || 0;
    const profit = income - expenses;
    return profit;
  };

  const calculateApmokestinamosPajamos = () => {
    const apmokestinamosPajamosValue = calculateProfit() * 0.9;
    setApmokestinamosPajamos(apmokestinamosPajamosValue.toFixed(2).toString());
  };

  const calculateVSDAmount = () => {
    const vsdValue = parseFloat(displayedValues.VSD) || 0;

    const VSDAmount =
      (!additionalPension
        ? calculateProfit() * 0.9 * 0.1552
        : calculateProfit() * 0.9 * 0.1252) - vsdValue;

    setVSD(!isNaN(VSDAmount) ? VSDAmount.toFixed(2).toString() : '');
  };

  const calculatePSDAmount = () => {
    const psdValue = parseFloat(displayedValues.PSD) || 0;

    const PSDAmount = calculateProfit() * 0.9 * 0.0698 - psdValue;
    setPSD(!isNaN(PSDAmount) ? PSDAmount.toFixed(2).toString() : '');
  };

  const calculateGPMAmount = () => {
    const profit = calculateProfit();
    const GPMAmount =
      calculateProfit() <= 20000 ? profit * 0.9 * 0.05 : profit * 0.9 * 0.15;
    const GPMPercentage = profit <= 20000 ? '5%' : '15%';

    setGPMPercent(GPMPercentage);
    setGPM(!isNaN(GPMAmount) ? GPMAmount.toFixed(2).toString() : '0.00');
  };

  const calculateFinalIncome = () => {
    const profit = calculateProfit();
    const finalProfit =
      profit - parseFloat(PSD) - parseFloat(VSD) - parseFloat(GPM);
    const finalAllTaxes = profit - finalProfit;

    let finalTaxPercent =
      profit >= 0
        ? (finalAllTaxes / profit) * 100
        : (Math.abs(finalAllTaxes) / profit) * 100;

    setFinalIncome(finalProfit.toFixed(2).toString());
    setFinalTaxes(finalAllTaxes.toFixed(2).toString());
    setTaxPercent(
      !isNaN(finalTaxPercent) ? finalTaxPercent.toFixed(2).toString() : '0.00'
    );
  };

  useEffect(() => {
    calculateApmokestinamosPajamos();
    calculateVSDAmount();
    calculatePSDAmount();
    calculateGPMAmount();
    calculateFinalIncome();
  }, [
    receivedIncome,
    benefitsIncurred,
    displayedValues.VSD,
    displayedValues.PSD,
    additionalPension,
    PSD,
    VSD,
    GPM,
  ]);
  return (
    <StyledPage>
      <Form
        fields={fields}
        displayValues={handleDisplayValues}
        // onChange={handleInputChange}
      />

      <Display
        labelTitles={[
          'Apmokestinamos pajamos',
          'Gautos pajamos',
          'Sanaudos',
          'VSD',
          'PSD',
          'GPM',
          'Galutinės pajamos',
          'Galutiniai mokesčiai',
          'Mokesčių tarifas',
        ]}
        values={[
          apmokestinamosPajamos,
          receivedIncome,
          benefitsIncurred,
          VSD,
          PSD,
          GPM,
          finalIncome,
          finalTaxes,
          taxPercent,
        ]}
      />
    </StyledPage>
  );
};

export default Individualios_veiklos_mokesciu_skaiciuokle;
