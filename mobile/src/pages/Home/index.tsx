import React, { useEffect, useState } from 'react'
import { Feather as Icon } from '@expo/vector-icons'
import { View, ImageBackground, Image, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select';

import axios from '../../services/api'

interface SelectItem {
  label: string,
  value: string
}

interface IBGEUFResponse {
  sigla: string,
  nome: string
}

interface IBGECityResponse {
  nome: string
}

const Home = () => {
  const [UFs, setUFs] = useState<SelectItem[]>([])
  const [cities, setCities] = useState<SelectItem[]>([])

  const [selectedUF, setSelectedUF] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')

  const navigation = useNavigation()

  // get UFs
  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufs = response.data.map((uf: IBGEUFResponse) => { 
        return {
          value: uf.sigla,
          label: uf.nome
        }
      }).sort((a, b) => {
        return a.label.toUpperCase() > b.label.toUpperCase() ? 1 : a.label.toUpperCase() < b.label.toUpperCase() ? -1 : 0
      })

      setUFs(ufs)
    })
  }, [])

  // get Cities
  useEffect(() => {
    if (selectedUF === '0') {
      setCities([])
      return
    }

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => { 
          return { 
            value: city.nome,
            label: city.nome 
          } 
        }).sort((a, b) => {
          return a.label.toUpperCase() > b.label.toUpperCase() ? 1 : a.label.toUpperCase() < b.label.toUpperCase() ? -1 : 0
        })

        setCities(cityNames)
      })
  }, [selectedUF])

  function handleSelectUF(uf: string) {
    setSelectedUF(uf)
    console.log(uf)
  }

  function handleSelectCity(city: string) {
    setSelectedCity(city)
    console.log(city)
  }

  function hanldeNavigateToPoints() {
    if (selectedUF === '0' || selectedCity === '0') {
      Alert.alert('Seleção incorreta', 'Por favor, selecione uma UF e uma cidade')
      return
    }

    navigation.navigate('Points', {
      uf: selectedUF,
      city: selectedCity
    })
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1} } behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground 
        source={require('../../assets/home-background.png')} 
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }}
      >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />

          <View>
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <RNPickerSelect
            style={pickerSelectStyles}
            onValueChange={(value) => handleSelectUF(value)}
            placeholder={{ label: 'Selecione a UF', value: '0', color: '#A0A0B2' }}
            items={UFs}
          />
          <RNPickerSelect
            style={pickerSelectStyles}
            onValueChange={(value) => handleSelectCity(value)}
            placeholder={{ label: 'Selecione a Cidade', value: '0', color: '#A0A0B2' }}
            items={cities}
          />

          <RectButton style={styles.button} onPress={hanldeNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name='arrow-right' color='#fff' size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText}>Entrar</Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    color: '#6C6C80'
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: styles.input,
  inputAndroid: styles.input,
});

export default Home