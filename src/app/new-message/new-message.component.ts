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

// Define FilterGroup for grouping Users and Channels
export interface FilterGroup {
  type: string; // Group Type ('Channels' or 'Users')
  items: { name: string; id: string , img: string}[]; // List of item names
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
  private firebaseService = inject(FirebaseService); // Inject Firebase service

  @ViewChild(ChatComponent) chatComponent!: ChatComponent;
 
  stateForm = this._formBuilder.group({
    searchField: '', // Use searchField for the input field
  });

  filterGroups: FilterGroup[] = []; // To store the filter group results
  filterGroupOptions: Observable<FilterGroup[]> = new Observable(); // Observable to hold filtered data

  users$: Observable<User[]> = new Observable(); // Users from Firebase
  channels$: Observable<Channel[]> = new Observable(); // Channels from Firebase

   // Getter for the 'searchField' form control
   get searchFieldControl(): FormControl {
    return this.stateForm.get('searchField') as FormControl;
  }

  ngOnInit() {
    // Fetch users and channels from Firestore
    this.users$ = this.firebaseService.getUsers();
    this.channels$ = this.firebaseService.getChannels();

    this.filterGroupOptions = this.searchFieldControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => this._filterData(value || ''))
    ) ?? of([]); 

    this.searchFieldControl.valueChanges.subscribe(selectedId => {
      if (typeof selectedId === 'string') {
        console.log('Selected ID:', selectedId);
        // Handle the selected ID as needed
      }
    });

    this.supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if(this.supportsTouch && window.innerWidth < 992){
      this.isMobile = true;
    }
  }

  // Filter function to handle both Users and Channels
  private _filterData(value: string): Observable<FilterGroup[]> {
    const filterValue = typeof value === 'string' ? value : '';

  const isUserFilter = filterValue.startsWith('@');
  const isChannelFilter = filterValue.startsWith('#');

    if (isUserFilter) {
      const userFilterValue = value.slice(1).toLowerCase(); // Remove '@'
      return this.users$.pipe(
        map(users => {
          const filteredUsers = users.filter(user => user.name.toLowerCase().includes(userFilterValue));
          return [{ type: 'Users', items: filteredUsers.map(user => ({ name: user.name, id: user.id , img: user.img})) }];
        })
      );
    }

    if (isChannelFilter) {
      const channelFilterValue = value.slice(1).toLowerCase(); // Remove '#'
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

    return of([]); // Return an empty array if no filter is applied
  }


  onOptionSelected(event: any) {
    const selectedItem = event.option.value;  // Get the selected item object
    const selectedName = selectedItem.name;   // Extract the name
    const selectedId = selectedItem.id;       // Extract the ID

    this.searchFieldControl.setValue(selectedName, { emitEvent: false });

    // Update form control or handle selectedId as needed
    console.log('Selected ID:', selectedId);
    this.chatComponent.channelId = selectedId;
    this.chatComponent.receivingUserId = selectedId;
    console.log('send to receiver:',this.chatComponent.receivingUserId)
    console.log('send to channel:',this.chatComponent.channelId)
  }

}