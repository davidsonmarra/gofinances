import React from "react";
import { View, Text, TextInput, Button } from 'react-native';

export function Profile() {
  return (
    <View>
      <Text testID="title">Perfil</Text>
      <TextInput
        testID="input-name"
        placeholder="Nome"
        autoCorrect={false}
        value="Davidson"
      />
      <TextInput
        testID="input-surname"
        placeholder="Sobrenome"
        value="Marra"
      />
      <Button 
        title="Salvar"
        onPress={() => {}}
      />
    </View>
  );
}