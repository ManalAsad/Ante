import { ImageIcon } from 'lucide-react';
import { categoryStyle } from '../../../../logic/domain/categories.js';

export default function GoalCover({ goal, className = '', showCategory = true }) {
  const style = categoryStyle(goal.category);
  return <div className={`goal-cover ${className}`} 
  style={{ background: style.background, color: style.accent }}>

    {goal.photo ? <img src={goal.photo} alt={`Cover for ${goal.name || 'your goal'}`} 
    style={{ objectPosition: `50% ${goal.photoPosition ?? 50}%` }} /> :
      <ImageIcon size={29} strokeWidth={1.7} aria-hidden="true" />}

    {showCategory && <span className="category-badge">{goal.category}</span>}
    
  </div>;
}
