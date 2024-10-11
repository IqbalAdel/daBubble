import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';

export interface FilterGroup {
  type: string;
  items: { name: string; id: string , img: string}[]; 
}

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    ChatComponent,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatInputModule,
    CommonModule,
    
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent implements OnInit {
  isMobile: boolean = false;
  supportsTouch: boolean = false;

  private _formBuilder = inject(FormBuilder);
  private firebaseService = inject(FirebaseService); 

  @ViewChild(ChatComponent) chatComponent!: ChatComponent;
 
  stateForm = this._formBuilder.group({
    searchField: '',
  });

  filterGroups: FilterGroup[] = []; 
  filterGroupOptions: Observable<FilterGroup[]> = new Observable(); 

  users$: Observable<User[]> = new Observable(); 
  channels$: Observable<Channel[]> = new Observable(); 


   get searchFieldControl(): FormControl {
    return this.stateForm.get('searchField') as FormControl;
  }

  ngOnInit() {
    this.users$ = this.firebaseService.getUsers();
    this.channels$ = this.firebaseService.getChannels();

    this.filterGroupOptions = this.searchFieldControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => this._filterData(value || ''))
    ) ?? of([]); 

    this.searchFieldControl.valueChanges.subscribe(selectedId => {
      if (typeof selectedId === 'string') {
        console.log('Selected ID:', selectedId);

      }
    });

    this.supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if(this.supportsTouch && window.innerWidth < 992){
      this.isMobile = true;
    }
  }


  private _filterData(value: string): Observable<FilterGroup[]> {
    const filterValue = typeof value === 'string' ? value : '';

  const isUserFilter = filterValue.startsWith('@');
  const isChannelFilter = filterValue.startsWith('#');

    if (isUserFilter) {
      const userFilterValue = value.slice(1).toLowerCase(); 
      return this.users$.pipe(
        map(users => {
          const filteredUsers = users.filter(user => user.name.toLowerCase().includes(userFilterValue));
          return [{ type: 'Users', items: filteredUsers.map(user => ({ name: user.name, id: user.id , img: user.img})) }];
        })
      );
    }

    if (isChannelFilter) {
      const channelFilterValue = value.slice(1).toLowerCase(); 
      return this.channels$.pipe(
        map(channels => {
          const filteredChannels = channels.filter(channel => channel.name.toLowerCase().includes(channelFilterValue));
          return [{ 
            type: 'Channels', 
            items: filteredChannels
            .filter(channel => channel.id)
            .map(channel =>  ({ name: channel.name, id: channel.id!, img: ""})) }];
        })
      );
    }

    return of([]); 
  }


  onOptionSelected(event: any) {
    const selectedItem = event.option.value;  
    const selectedName = selectedItem.name;   
    const selectedId = selectedItem.id;      

    this.searchFieldControl.setValue(selectedName, { emitEvent: false });

    console.log('Selected ID:', selectedId);
    this.chatComponent.channelId = selectedId;
    this.chatComponent.receivingUserId = selectedId;
    console.log('send to receiver:',this.chatComponent.receivingUserId)
    console.log('send to channel:',this.chatComponent.channelId)
  }

}