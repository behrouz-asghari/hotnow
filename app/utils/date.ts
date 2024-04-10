import dayjs from "dayjs";
import jalaliday from "jalaliday";

dayjs.extend(jalaliday);

export function toShamsi(dateString: string) {
  return dayjs(dateString)
    .calendar("jalali")
    .locale("fa")
    .format("YYYY/MM/DD");
}