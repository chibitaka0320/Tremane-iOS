export const getPfcBalanceExplanation = (pfc: string): string => {
  switch (pfc) {
    case "0":
      return "P:40% F:20% C:40%";
    case "1":
      return "P:30% F:20% C:50%";
    case "2":
      return "P:55% F:25% C:20%";
    default:
      return "";
  }
};
