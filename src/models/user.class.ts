import { Channel } from "./channel.class";
import { Chat } from "./chat.class";

export class User {
    name: string;
    email: string;
    id?: string;
    img: string;
    password: string;
    channels?: Channel[];
    chats?: Chat[];

    constructor(
      name: string = '',
      email: string = '',
      id: string = '',
      img: string = '',
      password: string = '',
      channels: Channel[] = [],
      chats: Chat[] = []
    ) {
      this.name = name;
      this.email = email;
      this.id = id;
      this.img = img;
      this.password = password;
      this.channels = channels;
      this.chats = chats;
    }
  }
//     constructor(obj?: Partial<User>){
//         if(obj){
//             this.firstName = obj.firstName ?? "";
//             this.lastName = obj.lastName ?? "";
//             this.email = obj.email ?? "";
//             this. birthDate = obj. birthDate ?? 0;
//             this.street = obj.street ?? "";
//             this.zipCode = obj.zipCode ?? 0;
//             this.city = obj.city ?? "";
//             this.id = obj.id ?? "";

//         }
//     }

//     public toJSON(){
//         return {
//             firstName: this.firstName,
//             lastName: this.lastName,
//             email: this.email,
//             birthDate:this.birthDate,
//             street: this.street,
//             zipCode:this.zipCode,
//             city: this.city,
//             id: this.id,
//         }
//     }
// }