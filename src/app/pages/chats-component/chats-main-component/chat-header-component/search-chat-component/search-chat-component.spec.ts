import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchChatComponent } from './search-chat-component';

describe('SearchChatComponent', () => {
  let component: SearchChatComponent;
  let fixture: ComponentFixture<SearchChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchChatComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
