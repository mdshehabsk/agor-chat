import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatTokenBuilder } from 'agora-token';
import { IAgoraGetUsersResponse, IAgoraUserEntity } from './app.interface';

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

  /**
   * Fetch registered Agora Chat users from your app/org
   */
  async getUsers(): Promise<IAgoraUserEntity[]> {
    const appName = this.configService.get<string>('AGORA_APP_NAME');
    const orgName = this.configService.get<string>('AGORA_APP_ORGNAME');
    const restApi = this.configService.get<string>('AGORA_APP_REST_API');
    try {
      const url = `https://${restApi}/${orgName}/${appName}/users`;

      const token = this.generateAppToken();

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // example, depends on Agora REST API
        },
      });

      if (!response.ok) {
        throw new HttpException(
          `Agora API error: ${response.statusText}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const jsonData: unknown = await response?.json();

      // Optionally, add runtime validation here if needed
      const data = jsonData as IAgoraGetUsersResponse;

      return data?.entities;
    } catch {
      throw new HttpException('Failed to fetch users', HttpStatus.BAD_REQUEST);
    }
  }
  async getUser(username: string): Promise<IAgoraUserEntity> {
    const appName = this.configService.get<string>('AGORA_APP_NAME');
    const orgName = this.configService.get<string>('AGORA_APP_ORGNAME');
    const restApi = this.configService.get<string>('AGORA_APP_REST_API');
    try {
      const url = `https://${restApi}/${orgName}/${appName}/users/${username}`;

      const token = this.generateAppToken();

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // example, depends on Agora REST API
        },
      });

      if (!response.ok) {
        throw new HttpException(
          `Agora API error: ${response.statusText}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const jsonData: unknown = await response?.json();

      // Optionally, add runtime validation here if needed
      const data = jsonData as IAgoraGetUsersResponse;

      return data?.entities[0];
    } catch {
      throw new HttpException('Failed to fetch users', HttpStatus.BAD_REQUEST);
    }
  }
}
