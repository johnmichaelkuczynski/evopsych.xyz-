curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "Want to become a PhD in evolutionary psychology? That'\''s a long road, but here is the place to start... EvoPsych dot X Y Z. Explore twenty-nine micro-lectures, practice with our AI tutor, and get real-time feedback with AI-graded work. Master topics from survival to social life, all in one place. Start learning today at evopsych.xyz! Brought to you by Z H I Systems, creating customized certifications, courses, and apps for colleges, individuals, banks, and other organizations.",
    "voice": "echo"
  }' \
  --output artifacts/qr-course-demo/public/voice.mp3
