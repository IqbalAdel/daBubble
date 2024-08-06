export class Message {
    content: string;
    sentBy: string;
    sentTo: string;
    sentDate: string;
    emojies: string;
    id?: string;
  
    constructor(
      content: string = '',
      sentBy: string = '',
      sentTo: string = '',
      sentDate: string = '',
      emojies: string = '',
      id: string = '',
    ) {
      this.content = content;
      this.sentBy = sentBy;
      this.sentTo = sentTo;
      this.sentDate = sentDate;
      this.emojies = emojies;
      this.id = id;
    }
  }