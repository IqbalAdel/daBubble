export class User {
    name: string;
    email: string;
    id?: string;
    photo: string;
    password: string;
  
    constructor(
      name: string = '',
      email: string = '',
      id: string = '',
      photo: string = '',
      password: string = ''
    ) {
      this.name = name;
      this.email = email;
      this.id = id;
      this.photo = photo;
      this.password = password;
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