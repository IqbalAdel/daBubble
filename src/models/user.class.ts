// export class User{
//     firstName: string = "";
//     lastName: string = "";
//     email: string = "";
//     birthDate: number | Date = 0;
//     street: string = "";
//     zipCode: number = 0;
//     city: string = "";
//     id: string = "";

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