import React from 'react';
import {
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Person,
  AttachMoney,
  Business,
  Code,
} from '@mui/icons-material';

import { hubspotService } from '../../services/hubspotService';

/**
 * Chip para mostrar variables de HubSpot con iconos y colores
 */
interface VariableChipProps {
  variableName: string;
  label?: string;
  onDelete?: () => void;
  onClick?: () => void;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

const VariableChip: React.FC<VariableChipProps> = ({
  variableName,
  label,
  onDelete,
  onClick,
  size = 'small',
  variant = 'filled',
}) => {
  const parsedVariable = hubspotService.parseVariable(variableName);
  
  const getVariableIcon = () => {
    if (!parsedVariable) return <Code />;
    
    switch (parsedVariable.objectType) {
      case 'contact':
        return <Person />;
      case 'deal':
        return <AttachMoney />;
      case 'company':
        return <Business />;
      default:
        return <Code />;
    }
  };

  const getVariableColor = () => {
    if (!parsedVariable) return 'default';
    
    switch (parsedVariable.objectType) {
      case 'contact':
        return 'primary';
      case 'deal':
        return 'success';
      case 'company':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTooltipContent = () => {
    if (!parsedVariable) return variableName;
    
    const objectTypeLabels = {
      contact: 'Contacto',
      deal: 'Deal',
      company: 'Empresa',
    };

    return `${objectTypeLabels[parsedVariable.objectType as keyof typeof objectTypeLabels] || parsedVariable.objectType}: ${parsedVariable.propertyName}`;
  };

  return (
    <Tooltip title={getTooltipContent()} arrow>
      <Chip
        icon={getVariableIcon()}
        label={label || `{{${variableName}}}`}
        color={getVariableColor() as any}
        variant={variant}
        size={size}
        onDelete={onDelete}
        onClick={onClick}
        sx={{
          fontFamily: 'monospace',
          fontSize: size === 'small' ? '0.75rem' : '0.875rem',
          '& .MuiChip-label': {
            fontFamily: 'monospace',
          },
        }}
      />
    </Tooltip>
  );
};

export default VariableChip;
