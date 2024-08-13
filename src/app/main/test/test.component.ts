import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  userID = "";


  constructor(private route: ActivatedRoute){}

    ngOnInit(): void {
        this.route.paramMap.subscribe( paramMap => {
          this.userID = paramMap.get('id') ?? ""; 
          console.log('got id', this.userID)

          // this.getUser(this.userID);
        })
    }
}
