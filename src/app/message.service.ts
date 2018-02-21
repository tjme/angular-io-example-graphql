import { Injectable } from '@angular/core';

@Injectable()
export class MessageService {
  messages: string[] = [];

  add(message: string) {
    this.messages.push(message);
  }

  log<T>(item: T, prefix: string = 'Log: '): T {
    this.add(`${prefix}${typeof(item)  === 'string' ? item : JSON.stringify(item)}`);
    return item;
  }

  clear() {
    this.messages = [];
  }
}
