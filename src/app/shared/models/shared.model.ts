export type ApiResponse<T> = {
  isSuccess: boolean;
  data: T | null;
  error: Error | null;
  timestamp: Date;
};

export type PagedApiResponse<T> = {
  isSuccess: boolean;
  items: T[];
  pagination: PaginationMetadata;
  error: Error | null;
  timestamp: Date;
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
