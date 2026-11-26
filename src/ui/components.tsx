import Ionicons from '@expo/vector-icons/Ionicons';
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
import { useAppTheme } from '@/lib/theme';
import type { ThemePalette } from './theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({
  name,
  size = 21,
  color,
}: {
  name: IconName;
  size?: number;
  color?: ComponentProps<typeof Ionicons>['color'];
}) {
  const { palette } = useAppTheme();
  return <Ionicons name={name} size={size} color={color ?? palette.ivory} />;
}

const typography = {
  hero: 'font-display text-[34px] leading-[41px] tracking-[-0.6px]',
  title: 'font-display text-[30px] leading-[37px] tracking-[-0.5px]',
  heading: 'font-displayMedium text-[19px] leading-[26px] tracking-[-0.2px]',
  body: 'font-sans text-[14px] leading-[22px]',
  small: 'font-sans text-[12px] leading-[18px]',
  label: 'font-semibold text-[12px] leading-[18px]',
};

export function T({
  variant = 'body',
  tone = 'ivory',
  className = '',
  style,
  ...props
}: TextProps & {
  variant?: keyof typeof typography;
  tone?: keyof ThemePalette;
  className?: string;
}) {
  const { palette } = useAppTheme();
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
  tone = 'champagne',
}: {
  children: ReactNode;
  tone?: keyof ThemePalette;
}) {
  return (
    <T
      variant="label"
      tone={tone}
      className="uppercase tracking-[2.4px] mb-1.5"
      style={{ fontSize: 10 }}
    >
      {children}
    </T>
  );
}

export function Brand({ centered = false, compact = false }: { centered?: boolean; compact?: boolean }) {
  return (
    <View className={centered ? 'items-center' : 'items-start'}>
      <T
        variant="heading"
        tone="ivory"
        style={{ fontSize: compact ? 19 : 23, lineHeight: compact ? 24 : 29, letterSpacing: 0.3 }}
      >
        MiliBrows
      </T>
      <T variant="small" tone="stone" style={{ fontSize: 11, letterSpacing: 0.6, marginTop: -2 }}>
        Estudio de belleza
      </T>
    </View>
  );
}

export function Badge({
  label,
  tone = 'graphite',
  icon,
}: {
  label: string;
  tone?: 'graphite' | 'gold' | 'sage' | 'caramel' | 'danger';
  icon?: IconName;
}) {
  const { palette } = useAppTheme();
  const styles = {
    graphite: { bg: 'bg-graphite', text: 'sand' as const, icon: palette.stone },
    gold: { bg: 'bg-goldSoft', text: 'champagne' as const, icon: palette.champagne },
    sage: { bg: 'bg-sageSoft', text: 'sageLight' as const, icon: palette.sageLight },
    caramel: {
      bg: 'bg-caramelSoft',
      text: 'caramelLight' as const,
      icon: palette.caramelLight,
    },
    danger: {
      bg: 'bg-dangerSoft',
      text: 'danger' as const,
      icon: palette.danger,
    },
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
  variant?: 'primary' | 'dark' | 'gold' | 'secondary' | 'danger';
  size?: 'md' | 'sm';
  icon?: IconName;
}) {
  const { isDark, palette } = useAppTheme();
  const darkText = variant === 'primary' || variant === 'gold' || (variant === 'dark' && isDark);
  const variantClass = {
    primary: 'bg-primaryBg',
    dark: isDark ? 'bg-primaryBg' : 'bg-black',
    gold: 'bg-gold',
    secondary: 'bg-graphite',
    danger: 'bg-dangerSoft',
  }[variant];
  const textTone =
    variant === 'dark' && !isDark
      ? 'white'
      : darkText
        ? 'black'
        : variant === 'danger'
          ? 'danger'
          : 'ivory';
  const iconColor =
    variant === 'dark' && !isDark
      ? '#F3E5B5'
      : darkText
        ? palette.black
        : variant === 'danger'
          ? palette.danger
          : palette.ivory;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      className={`${size === 'sm' ? 'min-h-[42px] px-4 py-2 rounded-xl' : 'min-h-[52px] px-6 py-3.5 rounded-2xl'} flex-row items-center justify-center gap-2 ${variantClass}`}
      style={({ pressed }) => ({
        opacity: disabled || busy ? 0.45 : pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      {busy ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : icon ? (
        <Icon name={icon} size={size === 'sm' ? 16 : 18} color={iconColor} />
      ) : null}
      <T
        variant="label"
        tone={textTone}
        style={{ fontSize: size === 'sm' ? 13 : 15 }}
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
  const { palette } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      className="w-10 h-10 rounded-full bg-surface items-center justify-center"
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      <Icon name={name} size={19} color={palette.ivory} />
    </Pressable>
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
  const { palette } = useAppTheme();
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.champagne}
              />
            ) : undefined
          }
        >
          <View className="w-full max-w-[720px] self-center px-5 pt-4 pb-12 gap-5">
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
              <View className="pt-1">
                {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
                <T variant="hero" tone="ivory">
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
  tone = 'surface',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'surface' | 'graphite' | 'gold';
}) {
  const toneClass = {
    surface: 'bg-surface',
    graphite: 'bg-graphite',
    gold: 'bg-goldSoft',
  }[tone];

  return (
    <View className={`rounded-[22px] p-5 gap-4 ${toneClass} ${className}`}>
      {children}
    </View>
  );
}

export function Field({
  label,
  hint,
  password,
  leadingIcon,
  ...props
}: TextInputProps & {
  label?: string;
  hint?: string;
  password?: boolean;
  leadingIcon?: IconName;
}) {
  const { palette } = useAppTheme();
  const [visible, setVisible] = useState(false);

  if (leadingIcon) {
    return (
      <View className="gap-1.5">
        <View className="flex-row rounded-2xl bg-surface items-center px-4 py-3 gap-3">
          <Icon name={leadingIcon} size={19} color={palette.stone} />
          <View className="flex-1">
            {label && (
              <T variant="small" tone="stone" style={{ fontSize: 11, marginBottom: 1 }}>
                {label}
              </T>
            )}
            <TextInput
              {...props}
              accessibilityLabel={label || props.placeholder || 'Campo de texto'}
              secureTextEntry={password && !visible}
              placeholderTextColor={palette.muted}
              className="p-0 min-h-[24px] font-sans text-[14px] text-ivory"
              style={[{ textAlignVertical: props.multiline ? 'top' : 'center' }, props.style]}
            />
          </View>
          {password && (
            <Pressable
              onPress={() => setVisible((v) => !v)}
              accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="p-1.5"
            >
              <Icon
                name={visible ? 'eye-off-outline' : 'eye-outline'}
                size={19}
                color={palette.stone}
              />
            </Pressable>
          )}
        </View>
        {hint && (
          <T variant="small" tone="muted">
            {hint}
          </T>
        )}
      </View>
    );
  }

  return (
    <View className="gap-1.5">
      {label && (
        <T variant="label" tone="stone" style={{ fontSize: 12 }}>
          {label}
        </T>
      )}
      <View className="flex-row rounded-2xl bg-graphite/70 items-center">
        <TextInput
          {...props}
          accessibilityLabel={label || props.placeholder || 'Campo de texto'}
          secureTextEntry={password && !visible}
          placeholderTextColor={palette.muted}
          className="flex-1 px-4 py-3 min-h-[48px] font-sans text-[14px] text-ivory"
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
              size={19}
              color={palette.stone}
            />
          </Pressable>
        )}
      </View>
      {hint && (
        <T variant="small" tone="muted">
          {hint}
        </T>
      )}
    </View>
  );
}

export function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
  tone = 'ivory',
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  tone?: 'ivory' | 'danger';
}) {
  const { palette } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-4 py-4"
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <Icon
        name={icon}
        size={22}
        color={tone === 'danger' ? palette.danger : palette.sand}
      />
      <View className="flex-1">
        <T tone={tone} style={{ fontSize: 15 }}>
          {title}
        </T>
        {subtitle && (
          <T variant="small" tone="muted">
            {subtitle}
          </T>
        )}
      </View>
      <Icon name="chevron-forward" size={18} color={palette.muted} />
    </Pressable>
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
  const { palette } = useAppTheme();
  if (loading)
    return (
      <View accessibilityRole="progressbar" className="flex-row gap-3 items-center py-5">
        <ActivityIndicator color={palette.champagne} />
        <T tone="stone">Un momento…</T>
      </View>
    );
  if (!error && !notice) return null;
  return (
    <View
      accessibilityRole="alert"
      className={`p-4 rounded-2xl border gap-3 ${error ? 'bg-dangerSoft border-danger/35' : 'bg-sageSoft border-sage/35'}`}
    >
      <T tone={error ? 'danger' : 'sageLight'}>{error || notice}</T>
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
  const { palette } = useAppTheme();
  return (
    <Card className="items-center py-10">
      <View className="w-14 h-14 rounded-full bg-graphite border border-line items-center justify-center">
        <Icon name={icon} color={palette.champagne} size={24} />
      </View>
      <T variant="heading" tone="ivory" style={{ textAlign: 'center' }}>
        {title}
      </T>
      <T tone="stone" style={{ textAlign: 'center', maxWidth: 280 }}>
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
      <T variant="heading" tone="ivory">
        {title}
      </T>
      {action && onPress && (
        <Pressable accessibilityRole="button" onPress={onPress} className="py-1.5">
          <T variant="label" tone="champagne">
            {action} →
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
  const { isDark } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-full px-4 py-2 ${selected ? (isDark ? 'bg-primaryBg' : 'bg-black') : 'bg-graphite'}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
    >
      <T
        variant="label"
        tone={selected ? (isDark ? 'black' : 'white') : 'sand'}
        style={selected && !isDark ? { color: '#F3E5B5' } : undefined}
      >
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
        className="flex-1"
        style={{ backgroundColor: 'rgba(26, 26, 26, 0.55)' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        >
          <View
            accessibilityViewIsModal
            className="w-full max-w-[460px] self-center bg-surface rounded-[26px] p-6 gap-5"
            style={{
              shadowColor: '#1A1A1A',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.22,
              shadowRadius: 30,
              elevation: 14,
            }}
          >
            <T variant="heading" tone="ivory">
              {title}
            </T>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
