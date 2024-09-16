import { Component, OnInit, inject } from '@angular/core';
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
  items: string[]; // List of item names
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
  private _formBuilder = inject(FormBuilder);
  private firebaseService = inject(FirebaseService); // Inject Firebase service

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
  }

  // Filter function to handle both Users and Channels
  private _filterData(value: string): Observable<FilterGroup[]> {
    const isUserFilter = value.startsWith('@');
    const isChannelFilter = value.startsWith('#');

    if (isUserFilter) {
      const userFilterValue = value.slice(1).toLowerCase(); // Remove '@'
      return this.users$.pipe(
        map(users => {
          const filteredUsers = users.filter(user => user.name.toLowerCase().includes(userFilterValue));
          return [{ type: 'Users', items: filteredUsers.map(user => user.name) }];
        })
      );
    }

    if (isChannelFilter) {
      const channelFilterValue = value.slice(1).toLowerCase(); // Remove '#'
      return this.channels$.pipe(
        map(channels => {
          const filteredChannels = channels.filter(channel => channel.name.toLowerCase().includes(channelFilterValue));
          return [{ type: 'Channels', items: filteredChannels.map(channel => channel.name) }];
        })
      );
    }

    return of([]); // Return an empty array if no filter is applied
  }


  
}