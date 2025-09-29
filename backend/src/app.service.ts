/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatTokenBuilder } from 'agora-token';
import { IAgoraUserEntity } from './app.interface';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Build an Agora Chat user token
   */
  generateUserToken(account: string): string {
    const appId = this.configService.get<string>('AGORA_APP_ID') ?? '';
    const appCertificate =
      this.configService.get<string>('AGORA_APP_CERTIFICATE') ?? '';
    const expireTimeInSeconds = 3600;

    return ChatTokenBuilder.buildUserToken(
      appId,
      appCertificate,
      account,
      expireTimeInSeconds,
    );
  }

  generateAppToken(): string {
    const appId = this.configService.get<string>('AGORA_APP_ID') ?? '';
    const appCertificate =
      this.configService.get<string>('AGORA_APP_CERTIFICATE') ?? '';
    const expireTimeInSeconds = 3600;
    return ChatTokenBuilder.buildAppToken(
      appId,
      appCertificate,
      expireTimeInSeconds,
    );
  }

  async signupUser({
    password,
    username,
  }: {
    username: string;
    password: string;
  }): Promise<IAgoraUserEntity> {
    const appToken = this.generateAppToken();
    const restApi = this.configService.get<string>(`AGORA_APP_REST_API`);
    const orgName = this.configService.get<string>(`AGORA_APP_ORGNAME`);
    const appName = this.configService.get<string>(`AGORA_APP_NAME`);
    const url = `https://${restApi}/${orgName}/${appName}/users`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json	',
        Authorization: `Bearer ${appToken}`,
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res?.json();
    if (data?.error) {
      throw new HttpException(data?.error, HttpStatus.BAD_REQUEST);
    }
    const entity = data?.entities?.[0];
    if (
      !entity ||
      typeof entity !== 'object' ||
      typeof entity.uuid !== 'string' ||
      typeof entity.username !== 'string'
    ) {
      throw new HttpException(
        'Invalid user entity received',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      uuid: entity.uuid,
      username: entity.username,
      // Add other properties as required by IAgoraUserEntity
    } as IAgoraUserEntity;
  }
}
