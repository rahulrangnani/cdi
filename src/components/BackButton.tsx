import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

const BackButton = ({ fallback = '/', label = 'Back', className }: BackButtonProps) => {
  const navigate = useNavigate();
  const handleBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Go back" className={className}>
      <ArrowLeft className="h-4 w-4 mr-1" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
};

export default BackButton;
