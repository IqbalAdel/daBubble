import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  imgTextarea =['assets/img/add.png','assets/img/smiley/sentiment_satisfied.png','assets/img/smiley/alternate_email.png','assets/img/smiley/send.png']

  changeAdd(isHover: boolean){
    this.imgTextarea[0] = isHover ? 'assets/img/smiley/add-blue.png' : 'assets/img/add.png';
  }

  addSmiley(isHover: boolean){
    this.imgTextarea[1] = isHover ? 'assets/img/smiley/sentiment_satisfied-blue.png' : 'assets/img/smiley/sentiment_satisfied.png';
  }
  addEmailContact(isHover: boolean){
    this.imgTextarea[2] = isHover ? 'assets/img/smiley/alternate_email-blue.png' : 'assets/img/smiley/alternate_email.png';
  }
  sendNews(isHover: boolean){
    this.imgTextarea[3] = isHover ? 'assets/img/smiley/send-light-blue.png' : 'assets/img/smiley/send.png';
  }
}
