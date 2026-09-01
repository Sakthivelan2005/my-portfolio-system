import './GalaxySkeleton.css';

interface SkeletonProps {
  type?: 'avatar' | 'title' | 'text' | 'card';
  width?: string | number;
  height?: string | number;
}

export default function GalaxySkeleton({ type = 'text', width, height }: SkeletonProps) {
  return (
    <div 
      className={`galaxy-bone ${type}`} 
      style={{ width, height }} 
    />
  );
}