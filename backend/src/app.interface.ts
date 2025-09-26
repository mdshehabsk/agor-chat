// One entity in the “entities” array
export interface IAgoraUserEntity {
  uuid: string;
  type: string; // e.g. "user"
  created: number; // timestamp in ms
  modified: number; // timestamp in ms
  username: string;
  activated: boolean;
}

// The overall “get users” response
export interface IAgoraGetUsersResponse {
  path: string; // e.g. "/users"
  uri: string; // full URI
  timestamp: number; // server timestamp in ms
  entities: IAgoraUserEntity[];
  count: number;
  action: string; // e.g. "get"
  duration: number; // time taken in ms
}
