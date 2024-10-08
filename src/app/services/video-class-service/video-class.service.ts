/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VideoClassService {
  private readonly apiUrl = 'https://api.daily.co/v1/rooms';
  private readonly apiKey = environment.dailyApiKey;

  async createRoom(
    roomName: string,
    properties: VideoRoomProperties
  ): Promise<unknown> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          name: roomName,
          ...properties,
        },
      }),
    });

    return (await response.json()) as unknown;
  }

  async createOwnerToken(
    roomName: string,
    isOwner: boolean,
    canAdmin: boolean
  ): Promise<any> {
    const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: isOwner,
          // canAdmin,
        },
      }),
    });

    return ((await response.json()) as unknown as { token: string }).token;
  }
}

export interface VideoRoomProperties {
  enable_chat: boolean;
  expiring: boolean;
  max_participants: number;
  enable_hand_raising: boolean;
  enable_advanced_text_chat: boolean;
  enable_breakout_rooms: boolean;
  enable_screenshare: boolean;
  enable_emoji_reactions: boolean;
  enable_people_ui: boolean;
  enable_noise_cancellation: boolean;
  not_before: string;
  expires_at: string;
}
