import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://xholnsqzapffifkzymot.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhob2xuc3F6YXBmZmlma3p5bW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDg0NDMsImV4cCI6MjA2NDIyNDQ0M30.v0Yb8QYrcRY0PfQPfFV72JtBRga-jbSy8eWiohFzlAI"; 
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('application-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const full_name = form.full_name.value;
  const id_number = form.id_number.value;
  const kra_pin = form.kra_pin.value;
  const phone = form.phone.value;
  const county = form.county.value;
  const sub_county = form.sub_county.value;
  const ward = form.ward.value;

  const id_photo_file = form.id_photo.files[0];
  const kcse_cert_file = form.kcse_cert.files[0];
  const admission_letter_file = form.admission_letter.files[0];

  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Uploading files...';

  try {
    // Upload files to the 'applications' bucket
    const timestamp = Date.now();
    const uploads = [
      { file: id_photo_file, name: `id_${timestamp}_${id_photo_file.name}` },
      { file: kcse_cert_file, name: `kcse_${timestamp}_${kcse_cert_file.name}` },
      { file: admission_letter_file, name: `admission_${timestamp}_${admission_letter_file.name}` }
    ];

    const uploadedPaths = [];

    for (const { file, name } of uploads) {
      const { error } = await supabase.storage.from('applications').upload(name, file);
      if (error) throw error;
      uploadedPaths.push(name);
    }

    // Insert into Supabase table
    const { error: insertError } = await supabase
      .from('applications')
      .insert([{
        full_name,
        id_number,
        kra_pin,
        phone,
        county,
        sub_county,
        ward,
        id_photo: uploadedPaths[0],
        kcse_cert: uploadedPaths[1],
        admission_letter: uploadedPaths[2]
      }]);

    if (insertError) throw insertError;

    statusEl.textContent = 'Application submitted successfully!';
    form.reset();
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'An error occurred. Please try again.';
  }
});