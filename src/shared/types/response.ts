export type ErrorItem = {
  key: string;
  message: string;
};

export interface ResponseData<T> {
  data: T | null;
  status: "success" | "error";
  message: string;
  errors: ErrorItem[];
  tokens: { token: string; refresh: string } | null;
}
