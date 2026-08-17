import { useCallback, useRef } from "react";
import { ScrollView } from "react-native";

/**
 * El auto-scroll-al-input-enfocado de ScrollView es poco confiable en Android
 * (a diferencia de iOS), incluso con KeyboardAvoidingView.
 *
 * Usa `event.target` (el nodo nativo real que entrega el propio evento de
 * foco) en vez de una ref a un View envolvente: los Views con `className`
 * pasan por el wrapper de NativeWind, que no expone el ref nativo crudo que
 * `measureLayout` necesita ("ref.measureLayout must be called with a ref to
 * a native component"). `event.target` evita ese problema porque viene
 * directo del sistema de eventos nativo, sin pasar por refs de React.
 */
export function useKeyboardScrollToInput() {
  const scrollRef = useRef<ScrollView>(null);

  // el tipo del evento se deja como `any`: react-native-web mezcla los tipos
  // de TextInputProps en este proyecto y termina resolviendo `onFocus` como
  // el FocusEvent del DOM en vez del NativeSyntheticEvent de RN, aunque en
  // tiempo de ejecución (nativo) siempre es el evento sintético real.
  const handleFocus = useCallback((event: any) => {
    const target = event.target;
    // pequeño delay para dejar que el teclado empiece a animar antes de calcular el scroll
    setTimeout(() => {
      scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
        target,
        100,
        true,
      );
    }, 100);
  }, []);

  return { scrollRef, handleFocus };
}
