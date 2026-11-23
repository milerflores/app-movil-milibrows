import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import { useState, type ComponentProps, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { palette } from './theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({
  name,
  size = 22,
  color = palette.graphite,
}: {
  name: IconName;
  size?: number;
  color?: ComponentProps<typeof Ionicons>['color'];
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

const typography = {
  title: 'font-display text-[30px] leading-[38px] tracking-[-0.4px]',
  heading: 'font-displayMedium text-[19px] leading-[27px] tracking-[-0.2px]',
  body: 'font-sans text-[14px] leading-[22px]',
  small: 'font-sans text-[12px] leading-[18px]',
  label: 'font-semibold text-[12px] leading-[18px]',
};

export function T({
  variant = 'body',
  tone = 'graphite',
  className = '',
  style,
  ...props
}: TextProps & {
  variant?: keyof typeof typography;
  tone?: keyof typeof palette;
  className?: string;
}) {
  return (
    <Text
      {...props}
      className={`${typography[variant]} ${className}`}
      style={[{ color: palette[tone] }, style]}
    />
  );
}

export function Eyebrow({
  children,
  tone = 'caramel',
}: {
  children: ReactNode;
  tone?: keyof typeof palette;
}) {
  return (
    <T variant="label" tone={tone} className="uppercase tracking-[2px] mb-1.5">
      {children}
    </T>
  );
}

export function Badge({
  label,
  tone = 'sand',
  icon,
}: {
  label: string;
  tone?: 'sand' | 'sage' | 'gold' | 'caramel' | 'dark' | 'danger';
  icon?: IconName;
}) {
  const styles = {
    sand: { bg: 'bg-sand', text: 'stone' as const, icon: palette.stone },
    sage: { bg: 'bg-[#EBEEE5]', text: 'sageDark' as const, icon: palette.sageDark },
    gold: { bg: 'bg-goldSoft', text: 'caramelDark' as const, icon: palette.gold },
    caramel: { bg: 'bg-[#F5EBE4]', text: 'caramelDark' as const, icon: palette.caramelDark },
    dark: { bg: 'bg-black', text: 'champagne' as const, icon: palette.gold },
    danger: { bg: 'bg-[#F5E9E5]', text: 'danger' as const, icon: palette.danger },
  }[tone];
  return (
    <View className={`self-start flex-row items-center gap-1.5 px-3 py-1 rounded-full ${styles.bg}`}>
      {icon && <Icon name={icon} size={13} color={styles.icon} />}
      <T variant="label" tone={styles.text} style={{ fontSize: 11 }}>
        {label}
      </T>
    </View>
  );
}

export function Button({
  title,
  onPress,
  busy = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
}: {
  title: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'dark' | 'danger';
  size?: 'md' | 'sm';
  icon?: IconName;
}) {
  const dark = variant === 'dark' || variant === 'danger';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      className={`${size === 'sm' ? 'min-h-[42px] px-4 py-2' : 'min-h-[50px] px-6 py-3'} rounded-full flex-row items-center justify-center gap-2 ${variant === 'primary' ? 'bg-gold' : variant === 'secondary' ? 'bg-white border border-line' : variant === 'danger' ? 'bg-[#9B443C]' : 'bg-black'}`}
      style={({ pressed }) => ({ opacity: disabled || busy ? 0.45 : pressed ? 0.78 : 1 })}
    >
      {busy ? (
        <ActivityIndicator size="small" color={dark ? 'white' : palette.black} />
      ) : icon ? (
        <Icon
          name={icon}
          size={size === 'sm' ? 16 : 18}
          color={dark ? palette.white : palette.black}
        />
      ) : null}
      <T
        variant="label"
        tone={dark ? 'white' : 'black'}
        style={{ fontSize: size === 'sm' ? 13 : 14 }}
      >
        {title}
      </T>
    </Pressable>
  );
}

export function IconButton({
  name,
  label,
  onPress,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      className="w-11 h-11 rounded-full border border-line bg-white items-center justify-center"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Icon name={name} size={20} color={palette.black} />
    </Pressable>
  );
}

export function Brand() {
  return (
    <View>
      <Image
        source={require('../../assets/brand/logo.png')}
        style={{ width: 130, height: 43 }}
        contentFit="contain"
        accessibilityLabel="MiliBrows"
      />
      <T
        variant="small"
        tone="stone"
        style={{ fontSize: 8, letterSpacing: 3.5, textAlign: 'center', marginTop: -4 }}
      >
        STUDIO · BEAUTY & CARE
      </T>
    </View>
  );
}

export function Screen({
  children,
  title,
  eyebrow,
  back = false,
  action,
  refreshing = false,
  onRefresh,
  scrollRef,
}: {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  back?: boolean;
  action?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
}) {
  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.gold}
              />
            ) : undefined
          }
        >
          <View className="w-full max-w-[720px] self-center px-6 pt-5 pb-12 gap-5">
            {(back || action) && (
              <View className="flex-row justify-between items-center">
                {back ? (
                  <IconButton
                    name="arrow-back"
                    label="Volver"
                    onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                  />
                ) : (
                  <View />
                )}
                {action}
              </View>
            )}
            {title && (
              <View>
                {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
                <T variant="title" tone="black">
                  {title}
                </T>
              </View>
            )}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({
  children,
  className = '',
  tone = 'white',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'white' | 'sand' | 'dark';
}) {
  const toneClass =
    tone === 'dark'
      ? 'bg-black border-black'
      : tone === 'sand'
        ? 'bg-sand border-sand'
        : 'bg-white border-line';
  return (
    <View
      className={`border rounded-[22px] p-5 gap-4 ${toneClass} ${className}`}
      style={
        tone === 'white'
          ? {
              shadowColor: '#1A1A1A',
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 1,
            }
          : undefined
      }
    >
      {children}
    </View>
  );
}

export function Field({
  label,
  hint,
  password,
  ...props
}: TextInputProps & { label: string; hint?: string; password?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <View className="gap-2">
      <T variant="label">{label}</T>
      <View className="flex-row rounded-xl bg-white border border-line items-center">
        <TextInput
          {...props}
          accessibilityLabel={label}
          secureTextEntry={password && !visible}
          placeholderTextColor="#969086"
          className="flex-1 px-4 py-3 min-h-[50px] font-sans text-[14px] text-graphite"
          style={[{ textAlignVertical: props.multiline ? 'top' : 'center' }, props.style]}
        />
        {password && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="p-3"
          >
            <Icon
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={palette.stone}
            />
          </Pressable>
        )}
      </View>
      {hint && (
        <T variant="small" tone="stone">
          {hint}
        </T>
      )}
    </View>
  );
}

export function Feedback({
  error,
  notice,
  loading,
  onRetry,
}: {
  error?: string;
  notice?: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  if (loading)
    return (
      <View accessibilityRole="progressbar" className="flex-row gap-3 items-center py-5">
        <ActivityIndicator color={palette.gold} />
        <T tone="stone">Un momento…</T>
      </View>
    );
  if (!error && !notice) return null;
  return (
    <View
      accessibilityRole="alert"
      className={`p-4 rounded-xl gap-3 ${error ? 'bg-[#F5E9E5]' : 'bg-[#EBEEE5]'}`}
    >
      <T tone={error ? 'danger' : 'graphite'}>{error || notice}</T>
      {error && onRetry && (
        <Button title="Volver a intentar" variant="secondary" size="sm" onPress={onRetry} />
      )}
    </View>
  );
}

export function Empty({
  icon = 'sparkles-outline',
  title,
  message,
  action,
}: {
  icon?: IconName;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <Card className="items-center py-9">
      <View className="w-14 h-14 rounded-full bg-sand items-center justify-center">
        <Icon name={icon} color={palette.caramel} size={26} />
      </View>
      <T variant="heading" tone="black" style={{ textAlign: 'center' }}>
        {title}
      </T>
      <T tone="stone" style={{ textAlign: 'center' }}>
        {message}
      </T>
      {action}
    </Card>
  );
}

export function AuthGate({ children, returnTo }: { children: ReactNode; returnTo?: string }) {
  const { profile, loading, sessionError, refresh } = useAuth();
  const path = usePathname();
  if (loading) return <Feedback loading />;
  if (!profile)
    return (
      <>
        <Feedback
          error={sessionError}
          onRetry={() => {
            void refresh();
          }}
        />
        <Empty
          icon="person-outline"
          title="Un espacio para ti"
          message="Inicia sesión para gestionar tus citas, revisar tus pagos y acumular puntos en MiliBrows Club."
          action={
            <Button
              title="Iniciar sesión"
              onPress={() =>
                router.push({ pathname: '/acceso', params: { next: returnTo || path } })
              }
            />
          }
        />
        <Button
          title="Crear mi cuenta"
          variant="secondary"
          onPress={() => router.push({ pathname: '/registro', params: { next: returnTo || path } })}
        />
      </>
    );
  return children;
}

export function Divider() {
  return <View className="h-px bg-line" />;
}

export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View className="flex-row justify-between items-center gap-3">
      <T variant="heading" tone="black">
        {title}
      </T>
      {action && onPress && (
        <Pressable accessibilityRole="button" onPress={onPress} className="py-1.5">
          <T variant="label" tone="caramelDark">
            {action} ↗
          </T>
        </Pressable>
      )}
    </View>
  );
}

export function Chip({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${selected ? 'bg-black border-black' : 'bg-white border-line'}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
    >
      <T variant="label" tone={selected ? 'white' : 'stone'}>
        {title}
      </T>
    </Pressable>
  );
}

export function Dialog({
  visible,
  title,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-black/50"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        >
          <View
            accessibilityViewIsModal
            className="w-full max-w-[480px] self-center bg-ivory rounded-3xl p-6 gap-5"
          >
            <T variant="heading" tone="black">
              {title}
            </T>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
