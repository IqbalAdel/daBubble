export class User {
    name: string;
    email: string;
    id: string;
    img: string;
    password: string;
    channels?: string[];
    chats?: string[];
    isBlinking?: boolean;
    state: 'online' | 'offline'; 
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