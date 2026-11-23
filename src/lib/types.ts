export interface Profile {
  id: number;
  correo: string;
  roles: string[];
  activo: boolean;
  id_cliente: number | null;
  id_empleado: number | null;
  persona: {
    id?: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    nombre_completo: string;
    dni: string | null;
    telefono: string | null;
    correo_contacto: string | null;
    cliente?: { preferencias: string | null };
  } | null;
}

export interface Service {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio: string;
  duracion_minutos: number;
  activo?: boolean;
  visible_al_publico?: boolean;
}

export interface ManualDiscount {
  monto: string;
  id_motivo_descuento: number | null;
  motivo: string | null;
  nota: string | null;
  fecha_creacion: string;
}

export type ServiceExecutionState =
  | 'pendiente'
  | 'en_proceso'
  | 'realizado'
  | 'cancelado'
  | 'no_realizado';

export interface AppointmentService {
  id: number;
  id_servicio: number;
  id_empleado: number;
  estilista?: string | null;
  nombre_servicio_acordado: string;
  precio_lista: string;
  monto_descuento_automatico: string;
  precio_acordado: string;
  duracion_minutos: number;
  hora_inicio: string;
  estado_servicio: ServiceExecutionState;
  motivo_estado_servicio: string | null;
  descuento_manual?: ManualDiscount | null;
}

export interface AppointmentPayment {
  id: number;
  id_metodo_pago: number;
  metodo: string | null;
  importe: string;
  fecha_cobro: string;
  referencia_pago: string | null;
  estado: 'registrado' | 'anulado';
}

export interface Appointment {
  id: number;
  id_cliente?: number;
  fecha: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  fecha_finalizacion?: string | null;
  estado: 'confirmada' | 'completada' | 'cancelada' | 'no_asistio';
  motivo_cancelacion: string | null;
  servicios: AppointmentService[];
  cobros?: AppointmentPayment[];
  total_realizado?: string;
  total_pagado?: string;
  saldo_pendiente?: string;
}

export interface AvailabilityInterval {
  hora_inicio?: string;
  hora_fin?: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface Availability {
  id_empleado: number;
  nombre_completo: string;
  duracion_minutos: number;
  intervalos: AvailabilityInterval[];
}

export interface HistoryEntry extends AppointmentService {
  id_cita: number;
  cita: {
    id?: number;
    fecha: string;
    estado?: string;
    fecha_finalizacion: string | null;
  };
}

export interface LoyaltyLevel {
  id?: number;
  codigo: 'glow' | 'golden' | 'vip';
  nombre: string;
  orden?: number;
  puntos_minimos: number;
  porcentaje_descuento: string;
  activo: boolean;
}

export interface PointMovement {
  id: number;
  id_cliente: number;
  id_cobro: number | null;
  tipo: 'ganado' | 'reversion' | 'ajuste';
  puntos: number;
  motivo: string | null;
  fecha_creacion: string;
}

export interface Loyalty {
  puntos: number;
  monto_por_punto: string;
  nivel: LoyaltyLevel;
  siguiente_nivel: {
    id: number;
    codigo: string;
    nombre: string;
    puntos_minimos: number;
    porcentaje_descuento: string;
    puntos_faltantes: number;
  } | null;
  servicios_realizados: number;
  visitas: number;
  monto_pagado: string;
  movimientos: PointMovement[];
}

export interface ClientPayment {
  id: number;
  id_cita: number;
  id_metodo_pago: number;
  importe: string;
  fecha_cobro: string;
  referencia_pago: string | null;
  estado: 'registrado' | 'anulado';
  metodo?: { id: number; codigo: string; nombre: string };
  cita?: { id: number; fecha: string; estado: string };
}
