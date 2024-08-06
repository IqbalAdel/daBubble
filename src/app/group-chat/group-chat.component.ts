import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-chat.component.html',
  styleUrl: './group-chat.component.scss'
})
export class GroupChatComponent implements OnInit {
  groupId!: number;
  groupName!: string;

  currentDate!: string;
  currentTime!: string;
  displayDate!: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.groupName = this.route.snapshot.paramMap.get('name')!;

    const today = new Date();
    const formattedDate = today.toLocaleDateString();

    this.currentDate = today.toLocaleDateString();
    this.currentTime =this.formatTime(today);
    this.displayDate = this.isToday(today) ? 'Heute' : formattedDate;

  
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
}
