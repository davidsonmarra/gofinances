import styled, { css } from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';

interface IconProps {
  type: 'up' | 'down';
}

interface ContainerProps extends IconProps {
  isActive: boolean;
} 

export const Container = styled.View<ContainerProps>`
  width: 48%;
  /* flex-direction: row;
  justify-content: center;
  align-items: center;
  ${({ isActive, type }) => isActive && type === 'down' && css`
      background-color: ${({ theme }) => theme.colors.attention_light};
  `};
  ${({ isActive, type }) => isActive && type === 'up' && css`
      background-color: ${({ theme }) => theme.colors.succes_light};
  `}; */
  border: ${({ theme, isActive }) => 
    isActive ? '1.5px solid transparent' : `1.5px solid ${theme.colors.text}`
  };
  border-radius: 5px;
`;

export const Content = styled(RectButton)<ContainerProps>`
width: 100%;
flex-direction: row;
justify-content: center;
align-items: center;
${({ isActive, type }) => isActive && type === 'down' && css`
    background-color: ${({ theme }) => theme.colors.attention_light};
`};
${({ isActive, type }) => isActive && type === 'up' && css`
    background-color: ${({ theme }) => theme.colors.succes_light};
`};
/* border: ${({ theme, isActive }) => 
  isActive ? 'none' : `1.5px solid ${theme.colors.text}`
}; */
border-radius: 5px;
padding: 16px;
`;

export const Icon = styled(Feather)<IconProps>`
  font-size: ${RFValue(24)}px;
  margin-right: 12px;
  color: ${({ theme, type }) => 
    type === 'up' ? theme.colors.success : theme.colors.attention
  };
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
`;