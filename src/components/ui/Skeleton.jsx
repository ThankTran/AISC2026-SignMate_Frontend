export default function Skeleton({label='Đang tải dữ liệu'}) { return <div className="ui-skeleton" role="status" aria-busy="true" aria-label={label}><span/><span/><span/><span/></div>; }
