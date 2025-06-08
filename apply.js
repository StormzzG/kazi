const SUPABASE_URL = "https://xholnsqzapffifkzymot.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhob2xuc3F6YXBmZmlma3p5bW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDg0NDMsImV4cCI6MjA2NDIyNDQ0M30.v0Yb8QYrcRY0PfQPfFV72JtBRga-jbSy8eWiohFzlAI"; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function submitForm(event) {
  event.preventDefault();

  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const kraPin = document.getElementById('kraPin').value;
  const idPhoto = document.getElementById('idPhoto').files[0];
  const kcseCert = document.getElementById('kcseCert').files[0];
  const uniLetter = document.getElementById('uniLetter').files[0];

  // Upload files to Supabase Storage
  const uploadFile = async (bucket, file) => {
    if (!file) return null;
    const { data, error } = await supabase.storage.from(bucket).upload(`applications/${Date.now()}_${file.name}`, file);
    if (error) {
      console.error(`Error uploading ${file.name}:`, error);
      return null;
    }
    return data.path;
  };

  const idPhotoPath = await uploadFile('applications', idPhoto);
  const kcseCertPath = await uploadFile('applications', kcseCert);
  const uniLetterPath = await uploadFile('applications', uniLetter);

  // Insert into DB
  const { data, error } = await supabase.from('applications').insert([{
    full_name: fullName,
    email,
    phone,
    kra_pin: kraPin,
    id_photo_url: idPhotoPath,
    kcse_cert_url: kcseCertPath,
    uni_letter_url: uniLetterPath
  }]);

  if (error) {
    console.error('Insert error:', error);
    alert('There was an error submitting your application.');
  } else {
    alert('Application submitted successfully!');
    document.getElementById('applicationForm').reset();
  }
}