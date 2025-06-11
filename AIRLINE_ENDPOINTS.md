# Auth Microservice - Endpoints para Aerolíneas

## 📋 Resumen de Cambios

Se han agregado nuevas entidades y endpoints para soportar el sistema SaaS de aerolíneas:

### 🗄️ **Nuevas Entidades**

#### **Airline**
- `id`: ObjectId único
- `airline_name`: Nombre oficial de la aerolínea
- `alias`: Identificador único para URL (ej: "skyair-myairline")
- `country`: País de operación
- `contact_email`: Email institucional (único)
- `phone_number`: Teléfono de contacto
- `createdAt`, `updatedAt`: Timestamps

#### **AdminUser**
- `id`: ObjectId único
- `admin_name`: Nombre del administrador
- `admin_email`: Email del admin (único)
- `admin_password`: Contraseña hasheada
- `admin_phone`: Teléfono opcional
- `role`: "admin" por defecto
- `airline_id`: Referencia a Airline
- `createdAt`, `updatedAt`: Timestamps

#### **Subscription**
- `id`: ObjectId único
- `plan`: "premium" por defecto
- `status`: "active" por defecto
- `payment_method`: "credit_card" por defecto
- `card_number`, `cardholder_name`, `expiry_date`, `cvv`: Datos de pago simulados
- `airline_id`: Referencia a Airline
- `createdAt`, `updatedAt`: Timestamps

---

## 🔌 **Nuevos Endpoints**

### **1. Registro de Suscripción de Aerolínea**
**Pattern:** `auth.register.subscription`

**Input (RegisterSubscriptionDto):**
```typescript
{
  airline: {
    airline_name: string;     // "Aerolínea Internacional XYZ"
    alias: string;            // "xyz-airlines" 
    country: string;          // "Bolivia"
    contact_email: string;    // "info@xyzairlines.com"
    phone_number: string;     // "+591 2 2345678"
  },
  admin: {
    admin_name: string;       // "Juan Pérez"
    admin_email: string;      // "admin@xyzairlines.com"
    admin_password: string;   // "MiPassword123!" (será hasheada)
    admin_phone?: string;     // "+591 70123456" (opcional)
  },
  payment: {
    card_number: string;      // "1234567890123456"
    cardholder_name: string;  // "Juan Pérez"
    expiry_date: string;      // "12/25"
    cvv: string;              // "123"
    plan: string;             // "premium"
  }
}
```

**Output:**
```typescript
{
  user: {
    id: string;
    admin_name: string;
    admin_email: string;
    role: string;
    airline: {
      id: string;
      airline_name: string;
      alias: string;
      country: string;
    }
  },
  airline: {
    id: string;
    airline_name: string;
    alias: string;
    country: string;
    contact_email: string;
  },
  subscription: {
    id: string;
    plan: string;
    status: string;
  },
  token: string; // JWT token
}
```

### **2. Login de Administrador de Aerolínea**
**Pattern:** `auth.login.airline`

**Input (LoginAirlineDto):**
```typescript
{
  admin_email: string;    // "admin@xyzairlines.com"
  admin_password: string; // "MiPassword123!"
}
```

**Output:**
```typescript
{
  user: {
    id: string;
    admin_name: string;
    admin_email: string;
    role: string;
    airline: {
      id: string;
      airline_name: string;
      alias: string;
      country: string;
    }
  },
  airline: {
    id: string;
    airline_name: string;
    alias: string;
    country: string;
    contact_email: string;
  },
  token: string; // JWT token
}
```

---

## 🔒 **JWT Payload para Aerolíneas**

El token JWT para administradores de aerolíneas contiene:

```typescript
{
  id: string;           // ID del AdminUser
  admin_name: string;   // Nombre del administrador
  admin_email: string;  // Email del administrador
  role: string;         // "admin"
  airline: {
    id: string;         // ID de la aerolínea
    airline_name: string;
    alias: string;
    country: string;
  }
}
```

---

## ✅ **Validaciones Implementadas**

### **Registro de Suscripción:**
- ✅ Alias único de aerolínea
- ✅ Email único de aerolínea
- ✅ Email único de administrador
- ✅ Validaciones de formato (email, teléfono, tarjeta)
- ✅ Contraseña segura (8+ caracteres, mayúsculas, minúsculas, números)

### **Login de Aerolínea:**
- ✅ Verificación de email y contraseña
- ✅ Incluye datos de aerolínea relacionada

---

## 🚀 **Cómo usar desde el Frontend**

**Para el registro (desde SubscriptionComponent):**
```typescript
// Desde el client-gateway, enviar a:
// POST /auth/register-subscription
// Body: RegisterSubscriptionDto (datos del formulario de 3 pasos)
```

**Para el login:**
```typescript
// Desde el componente de login:
// POST /auth/login-airline  
// Body: { admin_email, admin_password }
```

---

## 📝 **Notas Importantes**

1. **Compatibilidad**: Los endpoints originales (`auth.register.user`, `auth.login.user`) siguen funcionando para mantener compatibilidad.

2. **Base de Datos**: Se mantiene MongoDB. Las nuevas entidades se agregaron sin afectar los datos existentes.

3. **Seguridad**: Las contraseñas se hashean con bcrypt antes de almacenarse.

4. **Relaciones**: Cada aerolínea tiene un administrador y una suscripción en relación 1:1.

5. **Validaciones**: Se implementaron validaciones robustas según los requisitos del frontend.
