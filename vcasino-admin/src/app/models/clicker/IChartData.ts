export interface IChartData<X, Y> {
  labels: X[];
  data: Y[];
  options: string[] | null;
  selectedOption: string | null;
}
