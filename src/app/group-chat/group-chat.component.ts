import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent implements OnInit {
  groupId!: string; 
  groupName!: string;

  currentDate!: string;
  currentTime!: string;
  displayDate!: string;
  imgSrc = ['assets/img/smiley/add_reaction.png', 'assets/img/smiley/comment.png','assets/person_add.png'];
  imgTextarea =['assets/img/add.png','assets/img/smiley/sentiment_satisfied.png','assets/img/smiley/alternate_email.png','assets/img/smiley/send.png']

  constructor(private route: ActivatedRoute,public userServes: UserService) { }

  ngOnInit(): void {
    // Observing paramMap to update component when route params change
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id') || '';
      this.groupName = params.get('name') || '';

      console.log('groupId:', this.groupId);
      console.log('groupName:', this.groupName);

      // Update any other component logic that depends on groupId or groupName
      this.updateDateTime();
    });
  }

  updateDateTime(): void {
    const today = new Date();
    this.currentDate = today.toLocaleDateString();
    this.currentTime = this.formatTime(today);
    this.displayDate = this.isToday(today) ? 'Heute' : this.currentDate;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return today.toDateString() === date.toDateString();
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  changeImageSmiley(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/img/smiley/add_reaction-blue.png' : 'assets/img/smiley/add_reaction.png';
  }

  changeImageComment(isHover: boolean) {
    this.imgSrc[1] = isHover ? 'assets/img/smiley/comment-blue.png' : 'assets/img/smiley/comment.png';
  }

  changeImageAddContat(isHover: boolean){
    this.imgSrc[2] = isHover ? 'assets/person_add_blue.png' : 'assets/person_add.png';
  }

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
