import {LiveAnnouncer} from '@angular/cdk/a11y';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, inject, model, signal, ViewEncapsulation, ViewChild, ElementRef, Inject, Input, ChangeDetectorRef} from '@angular/core';
import {FormControl, FormsModule} from '@angular/forms';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { User } from '../../../models/user.class';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-chips-add-members',
  standalone: true,
  imports: [
    MatFormFieldModule, 
    MatChipsModule, 
    MatIconModule, 
    MatAutocompleteModule, 
    FormsModule,
    CommonModule,
    
    
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chips-add-members.component.html',
  styleUrl: './chips-add-members.component.scss',
  // encapsulation: ViewEncapsulation.None
})
export class ChipsAddMembersComponent {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly currentUser = signal('');
  readonly users = signal<User[]>([]);  // Change to hold User objects instead of strings
  allUsers: User[] = [];  // Changed from string[] to User[]
  selectUsers: User[] = [];
  userInputControl = new FormControl('');
  @Input() test: string = '';

  filteredUsers = signal<User[]>([]); // Use signal for reactivity with User objects

  constructor(
    private fire: FirebaseService,
    private cdr: ChangeDetectorRef,
  ){
    this.fire.getUsersData().subscribe((list) => {
      this.selectUsers = list.map(element => {
        const data = element;
        return new User(
          data['name'] || '',
          data['email'] || '',
          data['id'] || '', // Falls `id` ein optionales Feld ist
          data['img'] || '',
          data['password'] || '',
          data['channels'] || [],
          data['chats'] || []
        );
      });
      this.cdr.detectChanges();
      this.allUsers = this.selectUsers; // Store the full User objects
      this.updateFilteredUsers();
      // console.log('now',this.allUsers)
      // console.log('received', this.selectUsers)
    });
  }
  readonly announcer = inject(LiveAnnouncer);

  @ViewChild('userInput', { static: false }) userInput!: ElementRef<HTMLInputElement>;

  inputDisabled: boolean = false;

  updateFilteredUsers(): void {
    console.log('this is current',this.currentUser())
    const currentUserName = this.currentUser().toLowerCase() || '';
    console.log('this is curretnName', currentUserName)

    const filtered = currentUserName
      ? this.allUsers.filter(user => user.name.toLowerCase().includes(currentUserName))
      : this.allUsers.slice();

    this.filteredUsers.set(filtered); // Update the signal
  }

  getUserNames(): string[] {
    return this.selectUsers.map(user => user.name);
  }

  // Handle input changes and update filtered users
  onInputChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.currentUser.set(input);
    this.updateFilteredUsers(); // Re-filter based on input
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const selectedUser = this.allUsers.find(user => user.name === value);

    if (selectedUser && !this.users().some(user => user.id === selectedUser.id)) {
      this.users.update(users => [...users, selectedUser]);
    } else {
      console.error('Invalid user name:', value);
    }

    if (this.userInput) {
      this.userInput.nativeElement.value = '';
    }

    // Clear the input value
    this.currentUser.set('');
    this.updateFilteredUsers(); // Re-filter after addition
  }

    // Check if the user is valid
    isValidUser(userName: string): boolean {
      return this.filteredUsers().some(user => user.name === userName);
    }

  remove(user: User): void {
    this.users.update(users => {
      const index = users.findIndex(u => u.id === user.id);
      if (index < 0) {
        return users;
      }

      users.splice(index, 1);
      this.announcer.announce(`Removed ${user}`);
      return [...users];
    });
    this.inputDisabled = false;
    this.currentUser.set('');
    this.updateFilteredUsers(); // Re-filter after addition

  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = this.allUsers.find(user => user.name === event.option.viewValue);

    if (selectedUser && !this.users().some(user => user.id === selectedUser.id)) {
      this.users.update(users => [...users, selectedUser]);
    }

    if (this.userInput) {
      this.userInput.nativeElement.value = '';
    }
    
    // Deselect the option
    event.option.deselect();
    this.inputDisabled = true;
    this.updateFilteredUsers(); // Re-filter after addition
  }

  shouldShowPlaceholder(): boolean {
    // Show placeholder if there are no items or input is not disabled
    return this.users().length === 0 && !this.inputDisabled;
  }

  onSubmit(): void {
    if (this.users().length === 0) {
      return;
    }
    // 1.Lade alle User in allUsers --- Done
    // 2.Auwahl von allUsers --- Done
    // 3.selectedUser wird mit ID abgestimmt (console) -- Done
    // 4. Nutzer wird über ID in channel und User collection geaddet

    console.log('Form submitted with users:', this.users());
  }

  userSelected(){
    if (this.users().length > 0) {
      return true;
    }
    else{
      return false
    }
  }
  
}
