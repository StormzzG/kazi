import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://xholnsqzapffifkzymot.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhob2xuc3F6YXBmZmlma3p5bW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDg0NDMsImV4cCI6MjA2NDIyNDQ0M30.v0Yb8QYrcRY0PfQPfFV72JtBRga-jbSy8eWiohFzlAI"; 
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("application-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const idPhoto = document.getElementById("id_photo").files[0];
  const kcseCert = document.getElementById("kcse_certificate").files[0];
  const universityLetter = document.getElementById("university_letter").files[0];

  if (!name || !email || !idPhoto || !kcseCert || !universityLetter) {
    alert("All fields including file uploads are required.");
    return;
  }

  const timestamp = Date.now();
  const folder = `user-${timestamp}`;

  // Upload all 3 files to 'applications' bucket
  const uploadFile = async (file, label) => {
    const filePath = `${folder}/${label}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("applications")
      .upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;

    const { data: urlData } = supabase
      .storage
      .from("applications")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  try {
    const idPhotoUrl = await uploadFile(idPhoto, "id");
    const kcseCertUrl = await uploadFile(kcseCert, "kcse");
    const universityLetterUrl = await uploadFile(universityLetter, "letter");

    // Now insert all data into the applications table
    const { data, error } = await supabase.from("applications").insert([
      {
        name,
        email,
        id_photo_url: idPhotoUrl,
        kcse_certificate_url: kcseCertUrl,
        university_letter_url: universityLetterUrl,
      },
    ]);

    if (error) throw error;

    alert("Application submitted successfully!");
    document.getElementById("application-form").reset();
  } catch (err) {
    console.error("Submission error:", err.message);
    alert("Failed to submit application.");
  }
});