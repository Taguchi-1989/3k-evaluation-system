import React from 'react';
import { useNavigation } from '@/hooks/useNavigation';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = ''
}) => {
  const { navigate } = useNavigation();

  const handleClick = (path: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav data-testid="breadcrumb" className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400 dark:text-gray-600">/</span>
          )}
          {item.path && !item.isActive ? (
            <button
              onClick={() => handleClick(item.path!)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={item.isActive ? 'text-gray-900 dark:text-white font-medium' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};