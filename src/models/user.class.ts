export class User {
    name: string;
    email: string;
    id: string;
    img: string;
    password: string;
    channels?: string[];
    chats?: string[];

    constructor(
      name: string = '',
      email: string = '',
      id: string = '',
      img: string = '',
      password: string = '',
      channels: string[] = [],
      chats: string[] = []
    ) {
      this.name = name;
      this.email = email;
      this.id = id;
      this.img = img;
      this.password = password;
      this.channels = channels;
      this.chats = chats;
    }

    public usersToJSON(){
      return {
          name: this.name,
          email: this.email,
          id: this.id,
          img:this.img,
          password: this.password,
          channels: this.channels,
          chats: this.chats,
      }
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