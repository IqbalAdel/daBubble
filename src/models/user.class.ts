export class User {
    name: string;
    email: string;
    id: string;
    img: string;
    password: string;
    channels?: string[];
    chats?: string[];
    isBlinking?: boolean;
    state: 'online' | 'offline';  // Default state is offline
    lastChanged: number; 

    constructor(
      nameOrUser?: string | User,
      email: string = '',
      id: string = '',
      img: string = '',
      password: string = '',
      channels: string[] = [],
      chats: string[] = [],
      state: 'online' | 'offline' = 'offline',
      lastChanged: number = Date.now(),
    ) {
      if (typeof nameOrUser === 'string' || nameOrUser === undefined) {
        // Initialize with provided parameters or defaults
        this.name = nameOrUser || '';
        this.email = email;
        this.id = id;
        this.img = img;
        this.password = password;
        this.channels = channels;
        this.chats = chats;
        this.state = state;
        this.lastChanged = lastChanged;

      } else {
        // Initialize with a copy of another User instance
        this.name = nameOrUser.name;
        this.email = nameOrUser.email;
        this.id = nameOrUser.id;
        this.img = nameOrUser.img;
        this.password = nameOrUser.password;
        this.channels = nameOrUser.channels ? [...nameOrUser.channels] : [];
        this.chats = nameOrUser.chats ? [...nameOrUser.chats] : [];
        this.state = nameOrUser.state;
        this.lastChanged = nameOrUser.lastChanged;
      }
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