import {Link} from 'react-router-dom';
import {useFriendSearch} from '../../hooks/useFriendSearch';
import DataState,{EmptyState} from '../ui/DataState';
import Avatar from '../ui/Avatar';
export default function FriendSearchResults({query,onAdd,sentRequests,pendingId}) {
 const {data,status,error,retry}=useFriendSearch(query);
 if(!query.trim())return null;
 return <section className="friends-section" aria-label="Kết quả tìm người học"><h2 className="text-h2">Tìm người học</h2>{query.trim().length<2?<p role="status">Nhập ít nhất 2 ký tự để tìm kiếm.</p>:<DataState status={status} error={error} retry={retry}>{!data.length?<EmptyState title="Không tìm thấy người học" description="Thử tên khác để tìm người học có hồ sơ công khai." to={null}/>:<ul className="friend-search-results">{data.map(person=>{
 const sent=sentRequests.includes(person.id)||person.status==='pending'&&person.direction==='outgoing';
 return <li key={person.id}><Avatar user={person} size={44}/><div><strong>{person.name}</strong><p className="text-caption">{person.mutualFriends} bạn chung · {person.statusText}</p></div>{person.status==='pending'&&person.direction==='incoming'?<Link to="/friends/friend-requests">Xem lời mời</Link>:<button type="button" disabled={!!pendingId||sent||person.status==='accepted'} onClick={()=>onAdd(person.id)}>{pendingId===person.id?'Đang gửi…':person.status==='accepted'?'Đã kết bạn':sent?'Đã gửi lời mời':'Kết bạn'}</button>}</li>;
 })}</ul>}</DataState>}</section>;
}
