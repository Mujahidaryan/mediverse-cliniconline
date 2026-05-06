import { query } from './db';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export async function initDB() {
  const schema = fs.readFileSync(path.join(process.cwd(), 'src/lib/schema.sql'), 'utf8');
  await query(schema);
  console.log('✅ Schema applied');
  await seedData();
}

async function seedData() {
  // Check if already seeded
  const existing = await query("SELECT COUNT(*) FROM users");
  if (parseInt(existing.rows[0].count) > 0) {
    console.log('ℹ️ DB already seeded');
    return;
  }

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Super Admin
  const sa = await query(`INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,$5,true,true) RETURNING id`,
    ['Dr. Sarah Al-Hassan', 'superadmin@mediverse.com', '+92-300-0000000', hash('Admin@123'), 'superadmin']);

  // Admin
  const admin = await query(`INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,$5,true,true) RETURNING id`,
    ['Admin Omar', 'admin@mediverse.com', '+92-300-1111111', hash('Admin@123'), 'admin']);

  // Doctors
  const doctorData = [
    { name: 'Dr. Zara Ahmed', email: 'zara@mediverse.com', spec: 'General Physician', exp: 12, fee: 1500, rating: 4.8, hospital: 'Aga Khan Hospital', loc: 'Karachi' },
    { name: 'Dr. Kamran Malik', email: 'kamran@mediverse.com', spec: 'Cardiologist', exp: 18, fee: 3500, rating: 4.9, hospital: 'Liaquat National', loc: 'Karachi' },
    { name: 'Dr. Fatima Rizvi', email: 'fatima@mediverse.com', spec: 'Neurologist', exp: 15, fee: 3000, rating: 4.7, hospital: 'CMH Hospital', loc: 'Lahore' },
    { name: 'Dr. Hassan Sheikh', email: 'hassan@mediverse.com', spec: 'Dermatologist', exp: 9, fee: 2000, rating: 4.6, hospital: 'Shaukat Khanum', loc: 'Lahore' },
    { name: 'Dr. Ayesha Qureshi', email: 'ayesha@mediverse.com', spec: 'Pediatrician', exp: 11, fee: 2500, rating: 4.8, hospital: 'Children Hospital', loc: 'Islamabad' },
    { name: 'Dr. Bilal Chaudhry', email: 'bilal@mediverse.com', spec: 'Orthopedic', exp: 20, fee: 4000, rating: 4.9, hospital: 'PIMS Hospital', loc: 'Islamabad' },
    { name: 'Dr. Nadia Hussain', email: 'nadia@mediverse.com', spec: 'Gynecologist', exp: 14, fee: 2800, rating: 4.7, hospital: 'Lady Dufferin', loc: 'Karachi' },
    { name: 'Dr. Tariq Mir', email: 'tariq@mediverse.com', spec: 'Psychiatrist', exp: 16, fee: 3200, rating: 4.5, hospital: 'Mental Health Institute', loc: 'Lahore' },
    { name: 'Dr. Sana Butt', email: 'sana@mediverse.com', spec: 'Nephrologist', exp: 13, fee: 3500, rating: 4.6, hospital: 'Kidney Center', loc: 'Karachi' },
    { name: 'Dr. Ali Nawaz', email: 'ali.nawaz@mediverse.com', spec: 'General Physician', exp: 8, fee: 1200, rating: 4.4, hospital: 'Medcare Clinic', loc: 'Rawalpindi' },
  ];

  for (const d of doctorData) {
    const u = await query(`INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,'doctor',true,true) RETURNING id`,
      [d.name, d.email, '+92-300-' + Math.floor(1000000 + Math.random() * 9000000), hash('Doctor@123')]);
    await query(`INSERT INTO doctor_profiles (user_id,specialization,experience_years,consultation_fee,rating,total_reviews,is_available,is_approved,hospital,location,bio) VALUES ($1,$2,$3,$4,$5,$6,true,true,$7,$8,$9)`,
      [u.rows[0].id, d.spec, d.exp, d.fee, d.rating, Math.floor(50 + Math.random() * 200), d.hospital, d.loc,
       `Expert ${d.spec} with ${d.exp} years of clinical experience providing evidence-based care to patients.`]);
  }

  // Assistants
  const assistantData = [
    { name: 'Aisha Bibi', email: 'aisha.asst@mediverse.com', skills: ['Nursing', 'Elderly Care', 'Wound Dressing'], exp: 5, rate: 800, loc: 'Karachi' },
    { name: 'Rehana Parveen', email: 'rehana.asst@mediverse.com', skills: ['Physiotherapy', 'Post-Surgery Care'], exp: 7, rate: 1200, loc: 'Lahore' },
    { name: 'Mohammad Raza', email: 'raza.asst@mediverse.com', skills: ['Elderly Care', 'Patient Transport', 'Nursing'], exp: 4, rate: 700, loc: 'Islamabad' },
    { name: 'Sobia Khan', email: 'sobia.asst@mediverse.com', skills: ['Pediatric Care', 'Nursing', 'Medication Management'], exp: 6, rate: 900, loc: 'Karachi' },
  ];

  for (const a of assistantData) {
    const u = await query(`INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,'assistant',true,true) RETURNING id`,
      [a.name, a.email, '+92-300-' + Math.floor(1000000 + Math.random() * 9000000), hash('Asst@123')]);
    await query(`INSERT INTO assistant_profiles (user_id,skills,experience_years,hourly_rate,daily_rate,location,rating,total_reviews,is_available,is_approved,bio) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,true,$9)`,
      [u.rows[0].id, a.skills, a.exp, a.rate, a.rate * 8, a.loc, (4.3 + Math.random() * 0.6).toFixed(1),
       Math.floor(20 + Math.random() * 80), `Certified healthcare assistant with ${a.exp} years experience.`]);
  }

  // Patients
  const patientData = [
    { name: 'Ahmad Raza', email: 'patient@mediverse.com', phone: '+92-301-1234567' },
    { name: 'Maryam Iqbal', email: 'maryam@mediverse.com', phone: '+92-302-7654321' },
  ];

  for (const p of patientData) {
    const u = await query(`INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,'patient',true,true) RETURNING id`,
      [p.name, p.email, p.phone, hash('Patient@123')]);
    await query(`INSERT INTO patient_profiles (user_id,gender,blood_group) VALUES ($1,'Male','B+')`, [u.rows[0].id]);
  }

  // Seed some appointments
  const patientRes = await query(`SELECT id FROM users WHERE role='patient' LIMIT 1`);
  const doctorRes = await query(`SELECT dp.id FROM doctor_profiles dp LIMIT 3`);
  if (patientRes.rows.length && doctorRes.rows.length) {
    const pid = patientRes.rows[0].id;
    for (let i = 0; i < doctorRes.rows.length; i++) {
      const did = doctorRes.rows[i].id;
      const d = new Date(); d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().split('T')[0];
      await query(`INSERT INTO appointments (patient_id,doctor_id,appointment_date,appointment_time,type,status,symptoms,consultation_fee) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [pid, did, dateStr, '10:00:00', i === 0 ? 'general' : 'specialized', i === 0 ? 'confirmed' : 'pending', 'Routine checkup', 2000]);
    }
  }

  // Seed payments
  const appRes = await query(`SELECT a.id, a.patient_id, a.consultation_fee FROM appointments a LIMIT 2`);
  for (const app of appRes.rows) {
    const comm = parseFloat(app.consultation_fee) * 0.1;
    await query(`INSERT INTO payments (user_id,reference_id,reference_type,amount,platform_commission,net_amount,status,payment_method,transaction_id) VALUES ($1,$2,'appointment',$3,$4,$5,'completed','card',$6)`,
      [app.patient_id, app.id, app.consultation_fee, comm.toFixed(2), (app.consultation_fee - comm).toFixed(2), 'TXN' + Date.now()]);
  }

  console.log('✅ Seed data inserted');
  console.log('📧 Login credentials:');
  console.log('   superadmin@mediverse.com / Admin@123');
  console.log('   admin@mediverse.com / Admin@123');
  console.log('   patient@mediverse.com / Patient@123');
  console.log('   zara@mediverse.com / Doctor@123');
}
