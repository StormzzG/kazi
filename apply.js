document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('application-form');
  const statusDiv = document.getElementById('form-status');

  const supabase = window.supabase.createClient(
    'https://xholnsqzapffifkzymot.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhob2xuc3F6YXBmZmlma3p5bW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDg0NDMsImV4cCI6MjA2NDIyNDQ0M30.v0Yb8QYrcRY0PfQPfFV72JtBRga-jbSy8eWiohFzlAI'
  );

  // Utility to show messages
  function showMessage(message, isSuccess = true) {
    statusDiv.textContent = message;
    statusDiv.className = isSuccess ? 'success' : 'error';
    setTimeout(() => {
      statusDiv.className = 'hidden';
    }, 5000);
  }

  // Sanitize filename to avoid upload errors
  function sanitizeFileName(filename) {
    return filename.replace(/[^\w.-]/g, '_');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = form.fullName.value.trim();
    const phoneNumber = form.phoneNumber.value.trim();
    const idNumber = form.idNumber.value.trim();
    const county = form.county.value.trim();
    const subCounty = form.subCounty.value.trim();
    const ward = form.ward.value.trim();
    const kraPin = form.kraPin.value.trim();
    const idPhotoFile = form.idPhoto.files[0];
    const kcseCertFile = form.kcseCert.files[0];

    // Validations
    if (!fullName || !phoneNumber || !idNumber || !county || !subCounty || !ward || !kraPin || !idPhotoFile || !kcseCertFile) {
      return showMessage("Please fill in all required fields", false);
    }

    if (!phoneNumber.startsWith('+254')) {
      return showMessage("Phone must start with +254", false);
    }

    if (kraPin.length !== 11) {
      return showMessage("KRA PIN must be 11 characters", false);
    }

    if (idNumber.length !== 8) {
      return showMessage("ID Number must be 8 digits", false);
    }

    try {
      const timestamp = Date.now();
      const idPhotoPath = `${timestamp}_${sanitizeFileName(idPhotoFile.name)}`;
      const kcsePath = `${timestamp}_${sanitizeFileName(kcseCertFile.name)}`;

      // Upload files to Supabase Storage
      const { error: idPhotoErr } = await supabase.storage
        .from('applications')
        .upload(idPhotoPath, idPhotoFile);

      const { error: kcseErr } = await supabase.storage
        .from('applications')
        .upload(kcsePath, kcseCertFile);

      if (idPhotoErr || kcseErr) {
        return showMessage("Error uploading documents", false);
      }

      // Insert form data to Supabase table
      const { error: insertError } = await supabase
        .from('applications')
        .insert([{
          full_name: fullName,
          phone_number: phoneNumber,
          id_number: idNumber,
          county,
          sub_county: subCounty,
          ward,
          kra_pin: kraPin,
          id_photo: idPhotoPath,
          kcse_cert: kcsePath
        }]);

      if (insertError) {
        return showMessage("Error saving application", false);
      }

      showMessage("Application submitted successfully!");
      form.reset();

    } catch (err) {
      console.error(err);
      showMessage("Unexpected error occurred", false);
    }
  });
});