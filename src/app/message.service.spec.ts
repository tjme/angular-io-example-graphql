import { MessageService } from './message.service';

let messageService: MessageService;

describe('MessageService', () => {
  beforeEach(() => {
    messageService = new MessageService;
  });

  it('should be created', () => {
    expect(messageService).toBeTruthy();
  });

  it('should be able to add message', () => {
    messageService.add('Test message');
    expect(messageService.messages.length).toBe(1);
    expect(messageService.messages[0]).toBe('Test message');
  });
});
