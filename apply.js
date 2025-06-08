const SUPABASE_URL = "https://xholnsqzapffifkzymot.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhob2xuc3F6YXBmZmlma3p5bW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDg0NDMsImV4cCI6MjA2NDIyNDQ0M30.v0Yb8QYrcRY0PfQPfFV72JtBRga-jbSy8eWiohFzlAI"; 
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== Helper Functions =====
function showMessage(type, text) {
  const messageBox = document.getElementById('form-message');
  messageBox.className = `message ${type}`;
  messageBox.textContent = text;
  messageBox.style.top = '20px';
  setTimeout(() => {
    messageBox.style.top = '-100px';
  }, 4000);
}

// ===== Form Submission =====
document.getElementById('application-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const kraPin = document.getElementById('kra_pin').value.trim();

  const idPhoto = document.getElementById('id_photo').files[0];
  const kcseCert = document.getElementById('kcse_cert').files[0];
  const admissionLetter = document.getElementById('admission_letter').files[0];

  // Validate fields
  if (!name || !email || !phone || !kraPin || !idPhoto || !kcseCert || !admissionLetter) {
    showMessage('error', 'Please fill all fields and upload all documents.');
    return;
  }

  if (!phone.startsWith('+254')) {
    showMessage('error', 'Phone number must start with +254.');
    return;
  }

  if (kraPin.length !== 11) {
    showMessage('error', 'KRA PIN must be exactly 11 characters.');
    return;
  }

  try {
    const timestamp = Date.now();

    // Upload files to Supabase Storage
    const uploadFile = async (file, label) => {
      const { data, error } = await supabase.storage
        .from('applications')
        .upload(`${label}_${timestamp}_${file.name}`, file);
      if (error) throw new Error(`Failed to upload ${label}`);
      return `${SUPABASE_URL}/storage/v1/object/public/applications/${data.path}`;
    };

    const idPhotoUrl = await uploadFile(idPhoto, 'id_photo');
    const kcseUrl = await uploadFile(kcseCert, 'kcse');
    const admissionUrl = await uploadFile(admissionLetter, 'admission');

    // Insert into table
    const { error: insertError } = await supabase
      .from('applications')
      .insert([
        {
          name,
          email,
          phone,
          kra_pin: kraPin,
          id_photo_url: idPhotoUrl,
          kcse_certificate_url: kcseUrl,
          admission_letter_url: admissionUrl
        }
      ]);

    if (insertError) throw new Error(insertError.message);

    showMessage('success', 'Application submitted successfully!');
    document.getElementById('application-form').reset();
  } catch (err) {
    console.error(err);
    showMessage('error', err.message || 'Something went wrong.');
  }
});