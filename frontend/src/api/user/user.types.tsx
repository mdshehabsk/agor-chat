
// One entity in the "entities" array
export interface IAgoraUserEntity {
  uuid: string;
  type: string; // e.g. "user"
  created: number; // timestamp in ms
  modified: number; // timestamp in ms
  username: string;
  activated: boolean;
}

export interface IUserSigninResponse {
    token : string
    userId: string
}

export interface IUserSignupPayload {
  username: string
  password: string
}