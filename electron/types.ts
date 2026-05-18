export type Credentials = {
  siteUrl: string;
  apiKey: string;
  apiSecret: string;
};

export type AppStore = {
  credentials?: Credentials;
};

export type FrappeListResponse<T> = {
  data: T[];
};

export type FrappeMethodResponse<T> = {
  message: T;
};

export type ActivityType = "start" | "stop";

export type ActivityInput = {
  project: string;
  type: ActivityType;
  description: string;
  sessionId?: string;
  createdAt?: string;
};

export type ActivityRecord = Required<ActivityInput> & {
  id: number;
};
