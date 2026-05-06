#!/usr/bin/env node
/**
 * Mediverse — DB Setup & Seed Script
 * Run: node scripts/setup.js
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log('🔗 Connecting to Neon PostgreSQL...');
  const client = await pool.connect();

  try {
    console.log('📐 Applying schema...');
    const schema = fs.readFileSync(path.join(__dirname, '../src/lib/schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Schema applied');

    const existing = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(existing.rows[0].count) > 0) {
      console.log('ℹ️  Database already seeded. Skipping.');
      return;
    }

    const hash = (pw) => bcrypt.hashSync(pw, 10);
    console.log('🌱 Seeding data...');

    // Super Admin
    await client.query(
      `INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,$5,true,true)`,
      ['Dr. Sarah Al-Hassan', 'superadmin@mediverse.com', '+92-300-0000000', hash('Admin@123'), 'superadmin']
    );

    // Admin
    await client.query(
      `INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,$5,true,true)`,
      ['Admin Omar', 'admin@mediverse.com', '+92-300-1111111', hash('Admin@123'), 'admin']
    );

    // Doctors
    const doctorData = [
      ['Dr. Zara Ahmed', 'zara@mediverse.com', 'General Physician', 12, 1500, 4.8, 'Aga Khan Hospital', 'Karachi'],
      ['Dr. Kamran Malik', 'kamran@mediverse.com', 'Cardiologist', 18, 3500, 4.9, 'Liaquat National', 'Karachi'],
      ['Dr. Fatima Rizvi', 'fatima@mediverse.com', 'Neurologist', 15, 3000, 4.7, 'CMH Hospital', 'Lahore'],
      ['Dr. Hassan Sheikh', 'hassan@mediverse.com', 'Dermatologist', 9, 2000, 4.6, 'Shaukat Khanum', 'Lahore'],
      ['Dr. Ayesha Qureshi', 'ayesha@mediverse.com', 'Pediatrician', 11, 2500, 4.8, 'Children Hospital', 'Islamabad'],
      ['Dr. Bilal Chaudhry', 'bilal@mediverse.com', 'Orthopedic', 20, 4000, 4.9, 'PIMS Hospital', 'Islamabad'],
      ['Dr. Nadia Hussain', 'nadia@mediverse.com', 'Gynecologist', 14, 2800, 4.7, 'Lady Dufferin', 'Karachi'],
      ['Dr. Tariq Mir', 'tariq@mediverse.com', 'Psychiatrist', 16, 3200, 4.5, 'Mental Health Institute', 'Lahore'],
      ['Dr. Sana Butt', 'sana@mediverse.com', 'Nephrologist', 13, 3500, 4.6, 'Kidney Center', 'Karachi'],
      ['Dr. Ali Nawaz', 'ali.nawaz@mediverse.com', 'General Physician', 8, 1200, 4.4, 'Medcare Clinic', 'Rawalpindi'],
    ];

    for (const [name, email, spec, exp, fee, rating, hospital, loc] of doctorData) {
      const u = await client.query(
        `INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,'doctor',true,true) RETURNING id`,
        [name, email, '+92-300-' + Math.floor(1000000 + Math.random() * 9000000), hash('Doctor@123')]
      );
      await client.query(
        `INSERT INTO doctor_profiles (user_id,specialization,experience_years,consultation_fee,rating,total_reviews,is_available,is_approved,hospital,location,bio) VALUES ($1,$2,$3,$4,$5,$6,true,true,$7,$8,$9)`,
        [u.rows[0].id, spec, exp, fee, rating, Math.floor(50 + Math.random() * 150), hospital, loc, `Expert ${spec} with ${exp} years of clinical experience.`]
      );
    }

    // Assistants
    const assistantData = [
      ['Aisha Bibi', 'aisha.asst@mediverse.com', ['Nursing', 'Elderly Care', 'Wound Dressing'], 5, 800, 'Karachi'],
      ['Rehana Parveen', 'rehana.asst@mediverse.com', ['Physiotherapy', 'Post-Surgery Care'], 7, 1200, 'Lahore'],
      ['Mohammad Raza', 'raza.asst@mediverse.com', ['Elderly Care', 'Patient Transport', 'Nursing'], 4, 700, 'Islamabad'],
      ['Sobia Khan', 'sobia.asst@mediverse.com', ['Pediatric Care', 'Nursing', 'Medication Management'], 6, 900, 'Karachi'],
    ];

    for (const [name, email, skills, exp, rate, loc] of assistantData) {
      const u = await client.query(
        `INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,'assistant',true,true) RETURNING id`,
        [name, email, '+92-300-' + Math.floor(1000000 + Math.random() * 9000000), hash('Asst@123')]
      );
      await client.query(
        `INSERT INTO assistant_profiles (user_id,skills,experience_years,hourly_rate,daily_rate,location,rating,total_reviews,is_available,is_approved,bio) VALUES ($1,$2,$3,$4,$5,$6,4.5,$7,true,true,'Certified healthcare assistant.')`,
        [u.rows[0].id, skills, exp, rate, rate * 8, loc, Math.floor(20 + Math.random() * 60)]
      );
    }

    // Patients
    const p1 = await client.query(
      `INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,'patient',true,true) RETURNING id`,
      ['Ahmad Raza', 'patient@mediverse.com', '+92-301-1234567', hash('Patient@123')]
    );
    await client.query('INSERT INTO patient_profiles (user_id,gender,blood_group) VALUES ($1,$2,$3)', [p1.rows[0].id, 'Male', 'B+']);

    const p2 = await client.query(
      `INSERT INTO users (name,email,phone,password_hash,role,is_active,is_verified) VALUES ($1,$2,$3,$4,'patient',true,true) RETURNING id`,
      ['Maryam Iqbal', 'maryam@mediverse.com', '+92-302-7654321', hash('Patient@123')]
    );
    await client.query('INSERT INTO patient_profiles (user_id,gender,blood_group) VALUES ($1,$2,$3)', [p2.rows[0].id, 'Female', 'A+']);

    // Sample appointments
    const docs = await client.query('SELECT id, consultation_fee FROM doctor_profiles LIMIT 3');
    for (let i = 0; i < docs.rows.length; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().split('T')[0];
      const appt = await client.query(
        `INSERT INTO appointments (patient_id,doctor_id,appointment_date,appointment_time,type,status,symptoms,consultation_fee) VALUES ($1,$2,$3,'10:00:00',$4,$5,'Routine checkup',$6) RETURNING id`,
        [p1.rows[0].id, docs.rows[i].id, dateStr, i === 0 ? 'general' : 'specialized', i === 0 ? 'confirmed' : 'pending', docs.rows[i].consultation_fee]
      );
      const fee = parseFloat(docs.rows[i].consultation_fee);
      const comm = fee * 0.1;
      await client.query(
        `INSERT INTO payments (user_id,reference_id,reference_type,amount,platform_commission,net_amount,status,payment_method,transaction_id) VALUES ($1,$2,'appointment',$3,$4,$5,$6,'card',$7)`,
        [p1.rows[0].id, appt.rows[0].id, fee, comm.toFixed(2), (fee - comm).toFixed(2), i === 0 ? 'completed' : 'pending', 'TXN' + Date.now() + i]
      );
    }

    console.log('\n✅ Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Login Credentials:');
    console.log('');
    console.log('  👑 Super Admin:  superadmin@mediverse.com  /  Admin@123');
    console.log('  🛡️  Admin:        admin@mediverse.com        /  Admin@123');
    console.log('  🏥 Patient:      patient@mediverse.com      /  Patient@123');
    console.log('  🏥 Patient 2:    maryam@mediverse.com       /  Patient@123');
    console.log('  🩺 Doctor (GP):  zara@mediverse.com         /  Doctor@123');
    console.log('  🫀 Doctor (Card):kamran@mediverse.com       /  Doctor@123');
    console.log('  🏠 Assistant:    aisha.asst@mediverse.com   /  Asst@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => { console.error('❌ Setup failed:', e.message); process.exit(1); });
