export const toIso = (value: { toString(): string } | null | undefined): string =>
  value == null ? '' : value.toString();

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
