import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string;
  buttonText: string;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  className?: string;
}

const SimpleCard = ({
  icon: Icon,
  title,
  description,
  details,
  buttonText,
  buttonDisabled = false,
  onButtonClick,
  className
}: SimpleCardProps) => {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
      "active:scale-[0.98] touch-manipulation",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary/10 rounded-xl shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold leading-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-sm mt-1 leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {details}
        </p>
        <Button
          variant={buttonDisabled ? "outline" : "default"}
          className="w-full h-11 text-base font-medium"
          disabled={buttonDisabled}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SimpleCard;