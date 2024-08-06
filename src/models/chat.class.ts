import { Message } from "./messages.class";

export class Chat {
    sender: string;
    receiver: string;
    messages: Message[];
    id?: string;
  
    constructor(
      sender: string = '',
      receiver: string = '',
      messages: Message[] = [],
      id: string = '',
    ) {
      this.sender = sender;
      this.receiver = receiver;
      this.messages = messages;
      this.id = id;
    }
  }