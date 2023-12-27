/* eslint camelcase: "off" */
import { Commons } from "./commons";

export module SlackModule {
  export class SlackAttachment {
    fallback: string;
    title: string;
    color: string;
    title_link: string;
    text: string;
    fields: SlackAttachmentField[];
    thumb_url: string;
    ts: Number;

    constructor(
      fallback: string,
      title: string,
      color: string,
      titleLink: string,
      text: string,
      thumbUrl: string,
      ts: Number
    ) {
      this.fallback = fallback;
      this.title = title;
      this.color = color;
      this.title_link = titleLink;
      this.text = text;
      this.thumb_url = thumbUrl;
      this.ts = ts;
    }
  }

  export class SlackAttachmentField {
    title: string;
    value: string;
    short: boolean;

    constructor(title: string, value: string, short: boolean) {
      this.title = title;
      this.value = value;
      this.short = short;
    }
  }

  export class SlackResponse implements Commons.TenBisResponse {
    response_type: string;
    text: string;
    attachments: SlackAttachment[];

    constructor(
      responseType: string,
      text: string,
      attachments: SlackAttachment[]
    ) {
      this.response_type = responseType;
      this.text = text;
      this.attachments = attachments;
    }
  }

  export class SlackRequest implements Commons.Request {
    body: SlackMessage;

    constructor(body: SlackMessage) {
      this.body = body;
    }
  }

  export class SlackMessage {
    token: string;
    team_id: string;
    team_domain: string;
    channel_id: string;
    channel_name: string;
    user_id: string;
    user_name: string;
    command: string;
    text: string;

    constructor(
      token: string,
      teamId: string,
      teamDomain: string,
      channelId: string,
      channelName: string,
      userId: string,
      userName: string,
      command: string,
      text: string
    ) {
      this.token = token;
      this.team_id = teamId;
      this.team_domain = teamDomain;
      this.channel_id = channelId;
      this.channel_name = channelName;
      this.user_id = userId;
      this.user_name = userName;
      this.command = command;
      this.text = text;
    }
  }
}
