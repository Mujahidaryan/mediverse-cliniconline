-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','doctor','assistant','admin','superadmin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCTOR PROFILES
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  specialization VARCHAR(100) NOT NULL,
  qualification VARCHAR(255),
  experience_years INTEGER DEFAULT 0,
  license_number VARCHAR(100),
  bio TEXT,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  languages TEXT[] DEFAULT ARRAY['English'],
  hospital VARCHAR(255),
  location VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSISTANT PROFILES
CREATE TABLE IF NOT EXISTS assistant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience_years INTEGER DEFAULT 0,
  location VARCHAR(255),
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  daily_rate DECIMAL(10,2) DEFAULT 0,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENT PROFILES
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(5),
  allergies TEXT,
  chronic_conditions TEXT,
  emergency_contact VARCHAR(255),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCTOR AVAILABILITY SLOTS
CREATE TABLE IF NOT EXISTS doctor_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, slot_date, slot_time)
);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES doctor_profiles(id),
  slot_id UUID REFERENCES doctor_slots(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  type VARCHAR(30) DEFAULT 'general' CHECK (type IN ('general','specialized','follow_up')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  symptoms TEXT,
  notes TEXT,
  prescription TEXT,
  consultation_fee DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HOME ASSISTANT BOOKINGS
CREATE TABLE IF NOT EXISTS assistant_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id),
  assistant_id UUID REFERENCES assistant_profiles(id),
  start_date DATE NOT NULL,
  end_date DATE,
  service_type VARCHAR(100),
  hours_per_day INTEGER DEFAULT 8,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','active','completed','cancelled')),
  total_amount DECIMAL(10,2),
  notes TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  reference_id UUID,
  reference_type VARCHAR(30) CHECK (reference_type IN ('appointment','assistant_booking')),
  amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  payment_method VARCHAR(50) DEFAULT 'card',
  transaction_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES users(id),
  target_id UUID NOT NULL,
  target_type VARCHAR(20) CHECK (target_type IN ('doctor','assistant')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(30) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYSTEM LOGS
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_spec ON doctor_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
