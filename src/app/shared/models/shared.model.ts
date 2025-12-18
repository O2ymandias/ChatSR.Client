export type ApiResponse<T> = {
  isSuccess: boolean;
  data: T | null;
  error: Error | null;
  timestamp: Date;
};

export type Error = {
  code: number;
  message: string;
};
