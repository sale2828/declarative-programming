export interface ApiResponse<T> {
  data: T | undefined;
  error: Error | undefined;
  status: ApiStatus
}

export enum ApiStatus {
  success = "SUCCESS",
  error = "ERROR",
  loading = "LOADING"
}
