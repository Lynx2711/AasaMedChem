// All quantities are stored in BASE units in the database:
//   weight → grams (g)
//   volume → millilitres (mL)
//   count  → unit
//
// Conversion happens ONLY here, never scattered around the codebase.

export const TO_BASE = {
  g:    1,
  kg:   1000,
  mL:   1,
  L:    1000,
  unit: 1,
};

export const UNIT_TYPE_MAP = {
  g:    'weight',
  kg:   'weight',
  mL:   'volume',
  L:    'volume',
  unit: 'count',
};

export const UNITS_FOR_TYPE = {
  weight: ['g', 'kg'],
  volume: ['mL', 'L'],
  count:  ['unit'],
};

// Convert user-entered quantity in any unit → base units for DB storage
export function toBase(quantity, unit) {
  return parseFloat(quantity) * TO_BASE[unit];
}

// Convert base unit quantity → a specific display unit
export function fromBase(baseQuantity, unit) {
  return parseFloat(baseQuantity) / TO_BASE[unit];
}

// Given quantity in any unit + price per base unit → total price in INR
export function calcLineTotal(quantity, unit, pricePerBaseUnit) {
  const inBase = toBase(quantity, unit);
  return +(inBase * parseFloat(pricePerBaseUnit)).toFixed(6);
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}