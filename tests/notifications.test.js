import test from 'node:test';
import assert from 'node:assert/strict';
import {relativeNotificationTime,notificationPath,adaptNotifications} from '../src/api/notificationAdapter.js';
const now=Date.parse('2026-10-01T12:00:00Z');
test('notification dates use Vietnamese relative time and tolerate missing dates',()=>{
 assert.equal(relativeNotificationTime('2026-10-01T11:58:00Z',now),new Intl.RelativeTimeFormat('vi',{numeric:'auto'}).format(-2,'minute'));
 assert.equal(relativeNotificationTime('invalid',now),'');assert.equal(relativeNotificationTime(null,now),'');
});
test('notification types map to valid local routes without trusting arbitrary paths',()=>{
 assert.equal(notificationPath('friend-accepted'),'/friends/list');assert.equal(notificationPath('friend_request'),'/friends/friend-requests');
 assert.equal(notificationPath('call-invite'),'/friends/video-call-invites');assert.equal(notificationPath('ai-result'),'/practice-ai');
 const item=adaptNotifications([{id:1,type:'ai-result',message:'Có kết quả',path:'https://bad.example',createdAt:'2026-10-01T11:58:00Z'}],now)[0];
 assert.equal(item.path,'/practice-ai');assert.equal(item.title,'Có kết quả');assert.ok(item.time);
});
