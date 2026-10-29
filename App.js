
import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import {
  NavigationContainer,
  DefaultTheme,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { onAuthStateChanged } from "firebase/auth";

import { ResponsiveProvider } from "./utils/responsive";
import { auth } from "./firebase";

import TelaSplash from "./Telas/TelaSplash";
import Onboarding from "./Telas/Onboarding";
import TelaCadastro from "./Telas/TelaCadastro";
import TelaLogin from "./Telas/TelaLogin";
import TelaHome from "./Telas/TelaHome";
import TelaCadastrarDoacao from "./Telas/TelaCadastrarDoacao";

// CORES DO ALIMENTA+
const VERDE = "#006838";
const FUNDO = "#FFFCF6";

const Stack = createNativeStackNavigator();

// TEMA DA NAVEGAÇÃO
const tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: VERDE,
    background: FUNDO,
    card: FUNDO,
    text: "#253226",
    border: "transparent",
    notification: "#FF7827",
  },
};

// MOSTRAR ERROS DE RENDERIZAÇÃO
// DIRETAMENTE NO CELULAR
class CapturarErroDeTela extends React.Component {
  state = {
    mensagem: "",
    detalhes: "",
  };

  static getDerivedStateFromError(error) {
    return {
      mensagem:
        error?.message || String(error),
    };
  }

  componentDidCatch(error, info) {
    console.error(
      "Erro ao renderizar o Alimenta+",
      error,
      info?.componentStack
    );

    this.setState({
      detalhes: info?.componentStack || "",
    });
  }

  render() {
    if (!this.state.mensagem) {
      return this.props.children;
    }

    return (
      <View style={styles.erroTela}>
        <Text style={styles.erroTitulo}>
          Não foi possível abrir esta tela
        </Text>

        <Text style={styles.erroTexto}>
          Fotografe esta mensagem para
          identificarmos o erro do APK,
          sem precisar usar ADB.
        </Text>

        <ScrollView style={styles.erroPainel}>
          <Text
            selectable
            style={styles.erroDetalhes}
          >
            {this.state.mensagem}
            {"\n\n"}
            {this.state.detalhes}
          </Text>
        </ScrollView>

        <Pressable
          style={styles.botao}
          onPress={() =>
            this.setState({
              mensagem: "",
              detalhes: "",
            })
          }
        >
          <Text style={styles.botaoTexto}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }
}

// COMPONENTE PRINCIPAL
export default function App() {
  // CARREGAR FONTES ANTES DAS TELAS
  const [
    fontesCarregadas,
    erroFontes,
  ] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // CONTROLE DE AUTENTICAÇÃO
  const [usuario, setUsuario] =
    useState(undefined);

  const [
    abrirLoginDireto,
    setAbrirLoginDireto,
  ] = useState(false);

  const estavaLogado = useRef(false);

  // MONITORAR SESSÃO FIREBASE
  useEffect(() => {
    const cancelar = onAuthStateChanged(
      auth,

      (conta) => {
        if (conta) {
          estavaLogado.current = true;
        } else if (estavaLogado.current) {
          estavaLogado.current = false;
          setAbrirLoginDireto(true);
        }

        setUsuario(conta);
      },

      (erro) => {
        console.error(
          "Erro ao verificar autenticação:",
          erro
        );

        setUsuario(null);
      }
    );

    return cancelar;
  }, []);

  // REGISTRAR ERRO DE FONTE
  useEffect(() => {
    if (erroFontes) {
      console.error(
        "Erro ao carregar Poppins:",
        erroFontes
      );
    }
  }, [erroFontes]);

  // ESPERAR FONTES E AUTENTICAÇÃO
  if (
    usuario === undefined ||
    (!fontesCarregadas && !erroFontes)
  ) {
    return (
      <SafeAreaProvider>
        <View style={styles.carregando}>
          <ActivityIndicator
            size="large"
            color={VERDE}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  // DEFINIR ROTA INICIAL
  const autenticado = Boolean(usuario);

  const inicio = autenticado
    ? "Home"
    : abrirLoginDireto
    ? "TelaLogin"
    : "Splash";

  return (
    <SafeAreaProvider>
      <ResponsiveProvider>
        <StatusBar
          style="dark"
          backgroundColor={FUNDO}
        />

        <CapturarErroDeTela>
          <NavigationContainer theme={tema}>
            <Stack.Navigator
              key={
                autenticado
                  ? "usuario"
                  : abrirLoginDireto
                  ? "login"
                  : "entrada"
              }
              initialRouteName={inicio}
              screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: {
                  backgroundColor: FUNDO,
                },
              }}
            >
              {autenticado ? (
                <>
                  <Stack.Screen
                    name="Home"
                    component={TelaHome}
                  />

                  <Stack.Screen
                    name="TelaCadastrarDoacao"
                    component={TelaCadastrarDoacao}
                  />
                </>
              ) : (
                <>
                  <Stack.Screen
                    name="Splash"
                    component={TelaSplash}
                    options={{
                      gestureEnabled: false,
                    }}
                  />

                  <Stack.Screen
                    name="Onboarding"
                    component={Onboarding}
                  />

                  <Stack.Screen
                    name="TelaCadastro"
                    component={TelaCadastro}
                  />

                  <Stack.Screen
                    name="TelaLogin"
                    component={TelaLogin}
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </CapturarErroDeTela>
      </ResponsiveProvider>
    </SafeAreaProvider>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FUNDO,
  },

  erroTela: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: FUNDO,
  },

  erroTitulo: {
    fontWeight: "700",
    fontSize: 20,
    color: VERDE,
  },

  erroTexto: {
    fontSize: 13,
    marginVertical: 12,
    color: "#465A48",
  },

  erroPainel: {
    flexGrow: 0,
    maxHeight: 230,
    backgroundColor: "#FAE9E7",
    padding: 14,
    borderRadius: 12,
  },

  erroDetalhes: {
    color: "#8F2727",
    fontSize: 12,
    lineHeight: 19,
  },

  botao: {
    marginTop: 18,
    padding: 13,
    backgroundColor: VERDE,
    borderRadius: 10,
    alignItems: "center",
  },

  botaoTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
