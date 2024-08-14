import { Message } from "./messages.class";
import { User } from "./user.class";
import { Chat } from "./chat.class";

export class Channel {
    name: string;
    description: string;
    creator?: string;
    messages?: Message[];
    users?: (User | { name: string; email: string; id?: string; img: string; password: string; channels?: string[]; chats?: string[] })[];
    id?: string;
  
    constructor(
      name: string = '',
      description: string = '',
      creator: string = '',
      messages: Message[] = [],
      users: (User | { name: string; email: string; id?: string; img: string; password: string; channels?: string[]; chats?: string[] })[] = [],
      id: string = '',
    ) {
      this.name = name;
      this.description = description;
      this.creator = creator;
      this.messages = messages;
      this.users = users;
      this.id = id;
    }

    // public channelToJSON(){
    //           return {
    //               name: this.name,
    //               description: this.description,
    //               creator: this.creator,
    //               messages:this.messages,
    //               users: this.users?.map(user => user.usersToJSON()),
    //               id: this.id,
    //           }
    //       }
  }