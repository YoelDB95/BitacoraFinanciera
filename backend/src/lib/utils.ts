export const toIso = (value) => {
  return typeof value?.toString === 'function' ? value.toString() : value;
};

export const activeRateAmount = (rates: any[]) => {
  const today = new Date();
  const active =
    rates?.find(
      (rate) =>
        rate.validFrom <= today &&
        (!rate.validTo || rate.validTo >= today),
    ) ??
    rates?.[0];

  return active ? Number(active.amount) : 0;
};
