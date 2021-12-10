import React, { useCallback, useEffect, useState } from 'react';
import { HistoryCard } from '../../components/HistoryCard';
import { VictoryPie } from 'victory-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from 'styled-components';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer
} from './styles';
import { categories } from '../../utils/categories';
import { RFValue } from 'react-native-responsive-fontsize';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';

export interface TransactionData {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryData {
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const theme = useTheme();
  
  function handleDataChange(action: 'next' | 'prev') {
    if(action === 'next') 
      setSelectedDate(addMonths(selectedDate, 1));
    
    else 
      setSelectedDate(subMonths(selectedDate, 1));
    
  }

  async function loadData() {
    setIsLoading(true);
    const dataKey = `@gofinances:transactions_${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];
    const expensives = responseFormatted.filter(
      (expensive: TransactionData) => 
      expensive.type === 'negative' &&
      new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
      new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
    );
    const expensivesTotal = expensives.reduce((acumullator: number, expensive: TransactionData) => {
      return acumullator + Number(expensive.amount);
    }, 0);
    const totalByCategory: CategoryData[] = [];
    categories.forEach(category => {
      let categorySum = 0;
      expensives.forEach((expensive: TransactionData) => {
        if(expensive.category === category.key)
        categorySum += Number(expensive.amount);
      });
      const percent = `${(categorySum / expensivesTotal * 100).toFixed(0)}%`
      categorySum > 0 && totalByCategory.push({
        key: category.key,
        name: category.name,
        total: categorySum,
        totalFormatted: categorySum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        color: category.color,
        percent
      });
    });
    setTotalByCategories(totalByCategory);
  }

  useFocusEffect(useCallback(() => {
    loadData();
    setIsLoading(false);
  }, [selectedDate]));

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {
        isLoading ?
        <LoadContainer>
          <ActivityIndicator 
            color={theme.colors.primary} 
            size="large"
          /> 
        </LoadContainer> :
          <Content 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingBottom: useBottomTabBarHeight(),
              paddingHorizontal: 24
            }}
          >
            <MonthSelect>
              <MonthSelectButton onPress={() => handleDataChange('prev')}>
                <MonthSelectIcon name="chevron-left"/>
              </MonthSelectButton>

              <Month>
                {
                  format(selectedDate, 'MMMM, yyyy', {locale: ptBR})
                }
              </Month>

              <MonthSelectButton onPress={() => handleDataChange('next')}>
                <MonthSelectIcon name="chevron-right"/>
              </MonthSelectButton>
            </MonthSelect>
            <ChartContainer>
              <VictoryPie 
                data={totalByCategories}
                colorScale={totalByCategories.map(category => category.color)}
                style={{
                  labels: { 
                    fontSize: RFValue(18),
                    fontWeight: 'bold', 
                    fill: theme.colors.shape
                  }
                }}
                labelRadius={50}
                x="percent"
                y="total"
              />
            </ChartContainer>
            {
              totalByCategories.map(category =>
                <HistoryCard 
                  title={category.name}
                  amount={category.totalFormatted}
                  color={category.color}
                  key={category.key}
                />
              )
            }
          </Content>
      }
    </Container>
  );
}