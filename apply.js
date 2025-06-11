document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('application-form');
  const statusDiv = document.getElementById('form-status');

  const supabase = window.supabase.createClient(
    'https://xholnsqzapffifkzymot.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhob2xuc3F6YXBmZmlma3p5bW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDg0NDMsImV4cCI6MjA2NDIyNDQ0M30.v0Yb8QYrcRY0PfQPfFV72JtBRga-jbSy8eWiohFzlAI'
  );

  function showMessage(message, isSuccess = true) {
    statusDiv.textContent = message;
    statusDiv.className = isSuccess ? 'success' : 'error';
    setTimeout(() => {
      statusDiv.className = 'hidden';
    }, 5000);
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

    const idFront = form.idFrontPhoto.files[0];
    const idBack = form.idBackPhoto.files[0];
    const kcseCert = form.kcseCert.files[0];

    if (!fullName || !phoneNumber || !idNumber || !county || !subCounty || !ward || !kraPin || !idFront || !idBack || !kcseCert) {
      return showMessage("Please fill in all fields and upload all required files.", false);
    }

    if (!phoneNumber.startsWith('+254')) return showMessage("Phone number must start with +254", false);
    if (idNumber.length !== 8) return showMessage("ID Number must be 8 digits", false);
    if (kraPin.length !== 11) return showMessage("KRA PIN must be 11 characters", false);

    try {
      const timestamp = Date.now();
      const idFrontPath = `${timestamp}_id_front_${idFront.name}`;
      const idBackPath = `${timestamp}_id_back_${idBack.name}`;
      const kcseCertPath = `${timestamp}_kcse_${kcseCert.name}`;

      // Upload files
      const { error: idFrontErr } = await supabase.storage.from('applications').upload(idFrontPath, idFront);
      const { error: idBackErr } = await supabase.storage.from('applications').upload(idBackPath, idBack);
      const { error: kcseErr } = await supabase.storage.from('applications').upload(kcseCertPath, kcseCert);

      if (idFrontErr || idBackErr || kcseErr) {
        return showMessage("Error uploading one or more documents.", false);
      }

      // Save form data
      const { error: insertError } = await supabase.from('applications').insert([{
        full_name: fullName,
        phone_number: phoneNumber,
        id_number: idNumber,
        county,
        sub_county: subCounty,
        ward,
        kra_pin: kraPin,
        id_front_photo: idFrontPath,
        id_back_photo: idBackPath,
        kcse_cert: kcseCertPath
      }]);

      if (insertError) {
        console.error(insertError);
        return showMessage("Error saving application data.", false);
      }

      showMessage("Application submitted successfully!");
      form.reset();
    } catch (err) {
      console.error(err);
      showMessage("An unexpected error occurred.", false);
    }
  });
});