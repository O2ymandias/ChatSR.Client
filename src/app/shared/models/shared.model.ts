type ApiResponseBase = {
  isSuccess: boolean;
  error: Error | null;
  timestamp: Date;
};

export type ApiResponse<T> = ApiResponseBase & {
  data?: T | null;
};

export type PagedApiResponse<T> = ApiResponseBase & {
  items: T[];
  pagination: PaginationMetadata;
};

export type Error = {
  code: number;
  message: string;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type Theme = 'light' | 'dark';
