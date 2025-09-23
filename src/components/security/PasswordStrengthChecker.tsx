import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrength {
  score: number;
  strength: 'weak' | 'medium' | 'strong';
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  special: boolean;
}

interface PasswordStrengthCheckerProps {
  password: string;
  onStrengthChange?: (strength: PasswordStrength) => void;
}

const PasswordStrengthChecker = ({ password, onStrengthChange }: PasswordStrengthCheckerProps) => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    strength: 'weak',
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    special: false
  });

  useEffect(() => {
    const checkStrength = () => {
      const newStrength: PasswordStrength = {
        score: 0,
        strength: 'weak',
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
      };

      // Calcular score
      let score = 0;
      if (newStrength.length) score++;
      if (newStrength.uppercase) score++;
      if (newStrength.lowercase) score++;
      if (newStrength.numbers) score++;
      if (newStrength.special) score++;

      newStrength.score = score;
      
      if (score >= 4) {
        newStrength.strength = 'strong';
      } else if (score >= 3) {
        newStrength.strength = 'medium';
      } else {
        newStrength.strength = 'weak';
      }

      setStrength(newStrength);
      onStrengthChange?.(newStrength);
    };

    if (password) {
      checkStrength();
    } else {
      const emptyStrength: PasswordStrength = {
        score: 0,
        strength: 'weak',
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        special: false
      };
      setStrength(emptyStrength);
      onStrengthChange?.(emptyStrength);
    }
  }, [password, onStrengthChange]);

  if (!password) return null;

  const progressValue = (strength.score / 5) * 100;
  
  const getProgressColor = () => {
    if (strength.strength === 'strong') return 'bg-green-600';
    if (strength.strength === 'medium') return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getBadgeVariant = () => {
    if (strength.strength === 'strong') return 'default';
    if (strength.strength === 'medium') return 'secondary';
    return 'destructive';
  };

  const requirements = [
    { key: 'length', text: 'Pelo menos 8 caracteres', met: strength.length },
    { key: 'uppercase', text: 'Letra maiúscula', met: strength.uppercase },
    { key: 'lowercase', text: 'Letra minúscula', met: strength.lowercase },
    { key: 'numbers', text: 'Número', met: strength.numbers },
    { key: 'special', text: 'Caractere especial', met: strength.special },
  ];

  return (
    <div className="space-y-4">
      {/* Barra de progresso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Força da senha</span>
          <Badge variant={getBadgeVariant()}>
            {strength.strength === 'strong' && 'Forte'}
            {strength.strength === 'medium' && 'Média'}
            {strength.strength === 'weak' && 'Fraca'}
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {/* Requisitos */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Requisitos:</span>
        <div className="grid grid-cols-1 gap-2">
          {requirements.map((req) => (
            <div key={req.key} className="flex items-center space-x-2 text-sm">
              {req.met ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthChecker;