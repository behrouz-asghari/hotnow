declare module "persian-swear-words" {
  const PersianSwear: {
    isBad: (text: string) => boolean;
    hasSwear: (text: string) => boolean;
    filterWords: (text: string, symbol?: string) => string;
  };
  export default PersianSwear;
}
