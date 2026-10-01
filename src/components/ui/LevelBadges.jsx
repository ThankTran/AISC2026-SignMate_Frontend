import {curriculumLevel,xpLevel} from '../../utils/learningLevels';
export default function LevelBadges({user,xp}) {
 return <span className="level-badges"><span tabIndex={0} title="Cấp độ mô tả nội dung lộ trình: Cơ bản, Trung cấp, Nâng cao. Không phụ thuộc trực tiếp vào XP.">Cấp độ: {curriculumLevel(user)}</span><span tabIndex={0} title="Level thể hiện XP tích lũy: mỗi 1.000 XP tăng một Level.">Level {xpLevel(xp ?? user?.totalXp ?? user?.xp)}</span></span>;
}
