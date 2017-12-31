import { Commons } from "./commons";

export module HipChatModule {

    export class HipChatReq implements Commons.Request {
        body: HipChatReqBody;

        constructor(body: HipChatReqBody) {
            this.body = body;
        }
    }

    export class HipChatReqBody {
        event: string;
        item: HipChatReqItem;
        webhook_id: number;


        constructor(event: string, item: HipChatReqItem, webhook_id: number) {
            this.event = event;
            this.item = item;
            this.webhook_id = webhook_id;
        }
    }

    export class HipChatReqItem {
        message: HipChatReqItemMessage;
        room: HipChatReqItemRoom;

        constructor(message: HipChatReqItemMessage, room: HipChatReqItemRoom) {
            this.message = message;
            this.room = room;
        }
    }

    export class HipChatReqItemMessage {
        date: Date;
        from: HipChatReqItemMessageFrom;
        id: string;
        mentions: Array < Object > ;
        message: string;
        type: string;

        constructor(date: Date, from: HipChatReqItemMessageFrom, id: string, mentions: Array < Object > , message: string, type: string) {
            this.date = date;
            this.from = from;
            this.id = id;
            this.mentions = mentions;
            this.message = message;
            this.type = type;
        }
    }

    export class HipChatReqItemRoom {
        id: number;
        name: string;

        constructor(id: number, name: string) {
            this.id = id;
            this.name = name;
        }
    }

    export class HipChatReqItemMessageFrom {
        id: number;
        mention_name: string;
        name: string;

        constructor(id: number, mention_name: string, name: string) {
            this.id = id;
            this.name = name;
            this.mention_name = mention_name;
        }
    }

    export class HipChatResponse implements Commons.TenBisResponse {
        color: string;
        message: string;
        message_format: string;
        notify: boolean;

        constructor(color: string, message: string, notify: boolean, message_format: string) {
            this.color = color;
            this.message = message;
            this.notify = notify;
            this.message_format = message_format;
        }
    }
}