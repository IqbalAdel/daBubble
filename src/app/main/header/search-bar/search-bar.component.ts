import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../../models/user.class';
import { FilterGroup } from '../../../new-message/new-message.component';
import { combineLatest, debounceTime, distinctUntilChanged, map, Observable, startWith, switchMap } from 'rxjs';
import { Channel } from '../../../../models/channel.class';
import { MatDialog } from '@angular/material/dialog';
import { FirebaseService } from '../../../services/firebase.service';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    MatIcon,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatOptionModule,
    MatLabel,
    MatCardModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    CommonModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit{
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autocomplete!: MatAutocompleteTrigger;

  user: User = {
    name: '',
    email: 'Test@gmx.de',
    id: '',
    img: '',
    password: '',
    channels: [],
    chats: [],
    state: 'offline',
    lastChanged: Date.now(),
    usersToJSON: function (): { name: string; email: string; id: string; img: string; password: string; channels: string[]; chats: string[]; } {
      throw new Error('Function not implemented.');
    }
  };

  filterOpen = false;


  filterGroups: FilterGroup[] = [];
  filterGroupOptions: Observable<FilterGroup[]> = new Observable();

  users$: Observable<User[]> = new Observable(); 
  channels$: Observable<Channel[]> = new Observable();

  private _formBuilder = inject(FormBuilder);
 
  stateForm = this._formBuilder.group({
    searchField: '',
  });


   get searchFieldControl(): FormControl {
    return this.stateForm.get('searchField') as FormControl;
  }


  constructor( 
    public dialog: MatDialog,
    private firebaseService: FirebaseService,
    public userService: UserService,
    private router: Router,
    
  ) {

  }

  async ngOnInit(): Promise<void> {
      this.users$ = this.firebaseService.getUsers();
      this.channels$ = this.firebaseService.getChannels();
  
      this.filterGroupOptions = this.searchFieldControl.valueChanges.pipe(
        startWith(''), 
        debounceTime(300), 
        distinctUntilChanged(), 
        switchMap(value => this._filterData(value || ''))
      );
  
      this.searchFieldControl.valueChanges.subscribe(selectedId => {
        if (typeof selectedId === 'string') {
        this.filterOpen = true;
          console.log('Selected ID:', selectedId);
        }
      });

  }


  private _filterData(value: string): Observable<FilterGroup[]> {
    const filterValue = (value || '').trim().toLowerCase();
  
    return combineLatest([this.users$, this.channels$]).pipe(
      map(([users, channels]) => {
        const filteredUsers = users
          .filter(user => user.name.toLowerCase().includes(filterValue)) 
          .filter(user => !!user.id); 
  
        const filteredChannels = channels
          .filter(channel => channel.name.toLowerCase().includes(filterValue)) 
          .filter(channel => !!channel.id); 
  
        return [
          {
            type: 'Users',
            items: filteredUsers.map(user => ({
              name: user.name,
              id: user.id!,
              img: user.img,
              type: 'Users'
            }))
          },
          {
            type: 'Channels',
            items: filteredChannels.map(channel => ({
              name: channel.name,
              id: channel.id!,
              img: "",
              type: 'Channels'
            }))
          }
        ];
      })
    );
  }


  onOptionSelected(event: any) {
    const selectedItem = event.option.value; 
    	
    const selectedName = selectedItem.name;   
    const selectedId = selectedItem.id;     

    this.searchFieldControl.setValue(selectedName, { emitEvent: false });
    this.routeToSelectedItem(selectedItem)
    this.clearInputField();
    this.filterOpen = false;
  }

  routeToSelectedItem(selectedItem: any){
    if(selectedItem){
      switch (selectedItem.type) {
        case 'Users':
        this.userService.setSelectedUserId(selectedItem.id);
        this.router.navigate(['/main/chat', selectedItem.id]);  
          break;
      
        case 'Channels':
        this.router.navigate(['/main/group-chat', selectedItem.id]);  
          break;
      }
    }
  }

  clearInputField() {
    this.searchFieldControl.setValue('', { emitEvent: false });
  
    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }
  }

  onFocus(): void {
    const currentValue = this.searchFieldControl.value;
    
    this.searchFieldControl.setValue(currentValue || '', { emitEvent: true });
  }

  changeBottom(){
    setTimeout(() => {
      this.filterOpen = true;
      console.log(this.filterOpen, 'is')
      
    }, 100);
    console.log(this.filterOpen)
  }


  onBlur(){
    setTimeout(() => {
      this.filterOpen = false;
      if(this.autocomplete){
        this.autocomplete.closePanel();
      }
    }, 50);

  }


}
