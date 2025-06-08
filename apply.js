const SUPABASE_URL = "https://xholnsqzapffifkzymot.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhob2xuc3F6YXBmZmlma3p5bW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDg0NDMsImV4cCI6MjA2NDIyNDQ0M30.v0Yb8QYrcRY0PfQPfFV72JtBRga-jbSy8eWiohFzlAI"; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Reference to message box
const messageBox = document.getElementById('message');

// Handle form submission
document.getElementById('application-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Collect form data
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const kraPin = document.getElementById('kraPin').value.trim();
  const idPhoto = document.getElementById('idPhoto').files[0];
  const kcseCert = document.getElementById('kcseCert').files[0];
  const admissionLetter = document.getElementById('admissionLetter').files[0];

  // Validate phone format
  if (!phone.startsWith('+254')) {
    showMessage("Phone number must start with +254", "error");
    return;
  }

  if (kraPin.length !== 11) {
    showMessage("KRA PIN must be exactly 11 characters", "error");
    return;
  }

  // Upload files to Supabase storage
  const uploads = await Promise.all([
    uploadFile(idPhoto, `id-${Date.now()}-${idPhoto.name}`),
    uploadFile(kcseCert, `kcse-${Date.now()}-${kcseCert.name}`),
    uploadFile(admissionLetter, `admission-${Date.now()}-${admissionLetter.name}`)
  ]);

  if (uploads.includes(null)) {
    showMessage("File upload failed. Please try again.", "error");
    return;
  }

  // Save form data in Supabase table
  const { error } = await supabase.from('applications').insert({
    full_name: fullName,
    email: email,
    phone: phone,
    kra_pin: kraPin,
    id_photo_url: uploads[0],
    kcse_cert_url: uploads[1],
    admission_letter_url: uploads[2]
  });

  if (error) {
    showMessage("Error submitting application: " + error.message, "error");
  } else {
    showMessage("Application submitted successfully!", "success");
    document.getElementById('application-form').reset();
  }
});

// Upload file helper
async function uploadFile(file, path) {
  const { data, error } = await supabase.storage.from('applications').upload(path, file);
  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }
  const { data: urlData } = supabase.storage.from('applications').getPublicUrl(path);
  return urlData.publicUrl;
}

// Show message function
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.classList.remove('hidden');
  setTimeout(() => messageBox.classList.add('hidden'), 5000);
}