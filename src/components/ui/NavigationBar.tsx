import React from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { InteractiveButton } from './InteractiveButton';

interface NavigationBarProps {
  showBackButton?: boolean;
  title?: string;
  customActions?: React.ReactNode;
  className?: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  showBackButton = true,
  title,
  customActions,
  className = ''
}) => {
  const { goBack } = useNavigation();

  return (
    <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <InteractiveButton
            variant="ghost"
            onClick={() => goBack()}
            className="text-gray-600 dark:text-gray-300"
            aria-label="前のページに戻る"
            enableRipple={true}
            feedbackIntensity="normal"
          >
            ← 戻る
          </InteractiveButton>
        )}
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>
      
      {customActions && (
        <div className="flex items-center space-x-2">
          {customActions}
        </div>
      )}
    </div>
  );
};