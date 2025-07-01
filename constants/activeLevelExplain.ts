export const getActiveLevelExplanation = (activeLevel: string): string => {
  switch (activeLevel) {
    case "0":
      return "デスクワーク中心、運動習慣がほとんどない方";
    case "1":
      return "立ち仕事や軽い運動を週に数回行う方";
    case "2":
      return "力仕事や激しい運動を日常的に行う方";
    default:
      return "";
  }
};
