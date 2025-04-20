export interface IPaginatedResponse<T> {
  page: number;
  totalPages: number;
  data: T[];
}
