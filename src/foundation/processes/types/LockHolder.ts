export interface LockHolder {
  readonly pid: number;
  readonly token: string;
  readonly label: string;
  readonly started: string;
}
