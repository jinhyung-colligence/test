import { useLanguage } from '@/contexts/LanguageContext';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* 기존 icon.svg 사용 */}
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-full h-full"
        >
          <rect width="32" height="32" rx="6" fill="#2563eb"/>
          <path d="M16 8L24 12V20L16 24L8 20V12L16 8Z" stroke="white" strokeWidth="2" fill="none"/>
          <circle cx="16" cy="16" r="3" fill="white"/>
        </svg>
      </div>

      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-bold text-gray-900 leading-tight`}>
            {t('header.title')}
          </h1>
          {size !== 'sm' && (
            <p className="text-sm text-gray-600 leading-tight">
              {t('header.subtitle')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}