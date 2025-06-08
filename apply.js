const SUPABASE_URL = "https://xholnsqzapffifkzymot.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhob2xuc3F6YXBmZmlma3p5bW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDg0NDMsImV4cCI6MjA2NDIyNDQ0M30.v0Yb8QYrcRY0PfQPfFV72JtBRga-jbSy8eWiohFzlAI"; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get form and message element
const form = document.getElementById('application-form');
const messageElement = document.getElementById('form-message');

// Form submission handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageElement.textContent = ''; // Clear previous messages

  const fullName = form.fullName.value.trim();
  const idNumber = form.idNumber.value.trim();
  const kraPin = form.kraPin.value.trim();
  const phoneNumber = form.phoneNumber.value.trim();
  const idPhoto = form.idPhoto.files[0];
  const kcseCert = form.kcseCert.files[0];
  const admissionLetter = form.admissionLetter.files[0];

  // Basic validation
  if (
    !fullName ||
    !idNumber ||
    !kraPin ||
    !phoneNumber ||
    !idPhoto ||
    !kcseCert ||
    !admissionLetter
  ) {
    messageElement.textContent = '❌ Please fill out all required fields.';
    return;
  }

  if (kraPin.length !== 11) {
    messageElement.textContent = '❌ KRA PIN must be exactly 11 characters.';
    return;
  }

  if (!phoneNumber.startsWith('+254')) {
    messageElement.textContent = '❌ Phone number must start with +254.';
    return;
  }

  try {
    // Upload files to Supabase Storage
    const filePaths = {};
    const uploads = [
      { file: idPhoto, name: 'idPhoto' },
      { file: kcseCert, name: 'kcseCert' },
      { file: admissionLetter, name: 'admissionLetter' },
    ];

    for (const upload of uploads) {
      const { file, name } = upload;
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('applications')
        .upload(fileName, file);

      if (error) throw error;

      filePaths[name] = data.path;
    }

    // Save form data to Supabase Table
    const { error: insertError } = await supabase.from('applications').insert([
      {
        full_name: fullName,
        id_number: idNumber,
        kra_pin: kraPin,
        phone_number: phoneNumber,
        id_photo: filePaths.idPhoto,
        kcse_certificate: filePaths.kcseCert,
        admission_letter: filePaths.admissionLetter,
      },
    ]);

    if (insertError) throw insertError;

    messageElement.textContent = '✅ Application submitted successfully!';
    form.reset();
  } catch (err) {
    console.error(err);
    messageElement.textContent = '❌ Error submitting application. Please try again.';
  }
});
